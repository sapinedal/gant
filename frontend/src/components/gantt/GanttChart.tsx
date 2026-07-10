import { useMemo, useRef, useState } from 'react';
import { addDays, differenceInCalendarDays, eachDayOfInterval, format, isSameDay, isWeekend } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, CalendarRange, Plus } from 'lucide-react';
import type { Task, User } from '../../types';
import Button from '../ui/Button';
import { STATUS_META, toDateOnly } from './ganttUtils';
import TaskFilters, { type TaskFilterState } from './TaskFilters';

const DAY_WIDTH = 40;
const ROW_HEIGHT = 52;
const HEADER_HEIGHT = 52;

interface GanttChartProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskChange: (taskId: number, dates: { start_date: string; end_date: string }) => void;
  onAddTask: () => void;
  hasAnyTasks: boolean;
  filters: TaskFilterState;
  onFiltersChange: (filters: TaskFilterState) => void;
  members: User[];
  totalCount: number;
}

type DragMode = 'move' | 'resize-start' | 'resize-end';

interface DragState {
  taskId: number;
  mode: DragMode;
  startX: number;
  originalStart: Date;
  originalEnd: Date;
}

interface HoverState {
  task: Task;
  x: number;
  y: number;
}

function fmt(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function fmtShort(date: Date): string {
  return format(date, "d 'de' MMM", { locale: es });
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isTaskOverdue(task: Task): boolean {
  return task.status !== 'completed' && toDateOnly(task.end_date).getTime() < startOfToday().getTime();
}

export default function GanttChart({
  tasks,
  onTaskClick,
  onTaskChange,
  onAddTask,
  hasAnyTasks,
  filters,
  onFiltersChange,
  members,
  totalCount,
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const previewDatesRef = useRef<{ start: Date; end: Date } | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [previewDates, setPreviewDates] = useState<{ start: Date; end: Date } | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);

  const { rangeStart, days, months } = useMemo(() => {
    const today = new Date();
    let min = addDays(today, -3);
    let max = addDays(today, 14);

    if (tasks.length > 0) {
      const starts = tasks.map((t) => toDateOnly(t.start_date));
      const ends = tasks.map((t) => toDateOnly(t.end_date));
      min = addDays(new Date(Math.min(...starts.map((d) => d.getTime()))), -2);
      max = addDays(new Date(Math.max(...ends.map((d) => d.getTime()))), 4);
    }

    const allDays = eachDayOfInterval({ start: min, end: max });

    const monthGroups: { label: string; span: number }[] = [];
    allDays.forEach((day) => {
      const label = format(day, 'MMMM yyyy', { locale: es });
      const last = monthGroups[monthGroups.length - 1];
      if (last && last.label === label) {
        last.span += 1;
      } else {
        monthGroups.push({ label, span: 1 });
      }
    });

    return { rangeStart: min, days: allDays, months: monthGroups };
  }, [tasks]);

  function dayOffset(date: Date) {
    return differenceInCalendarDays(date, rangeStart);
  }

  function handlePointerDown(e: React.PointerEvent, task: Task, mode: DragMode) {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setHover(null);
    const next: DragState = {
      taskId: task.id,
      mode,
      startX: e.clientX,
      originalStart: toDateOnly(task.start_date),
      originalEnd: toDateOnly(task.end_date),
    };
    dragRef.current = next;
    setDrag(next);
  }

  function handlePointerMove(e: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    const deltaDays = Math.round((e.clientX - drag.startX) / DAY_WIDTH);

    let newStart = drag.originalStart;
    let newEnd = drag.originalEnd;

    if (deltaDays !== 0) {
      if (drag.mode === 'move') {
        newStart = addDays(drag.originalStart, deltaDays);
        newEnd = addDays(drag.originalEnd, deltaDays);
      } else if (drag.mode === 'resize-start') {
        newStart = addDays(drag.originalStart, deltaDays);
        if (newStart > drag.originalEnd) newStart = drag.originalEnd;
      } else if (drag.mode === 'resize-end') {
        newEnd = addDays(drag.originalEnd, deltaDays);
        if (newEnd < drag.originalStart) newEnd = drag.originalStart;
      }
    }

    previewDatesRef.current = { start: newStart, end: newEnd };
    setPreviewDates({ start: newStart, end: newEnd });
  }

  function handlePointerUp() {
    const drag = dragRef.current;
    if (drag) {
      const { start, end } = previewDatesRef.current ?? { start: drag.originalStart, end: drag.originalEnd };
      onTaskChange(drag.taskId, { start_date: fmt(start), end_date: fmt(end) });
    }
    dragRef.current = null;
    previewDatesRef.current = null;
    setDrag(null);
    setPreviewDates(null);
  }

  function showTooltip(e: React.MouseEvent, task: Task) {
    if (dragRef.current) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setHover({ task, x: rect.left + rect.width / 2, y: rect.top });
  }

  const todayOffset = dayOffset(new Date());

  // Layout de cada barra (posición/tamaño), reutilizado tanto para dibujar las filas
  // como para trazar las flechas de dependencia entre tareas.
  const rowLayouts = tasks.map((task, idx) => {
    const isDragging = drag?.taskId === task.id;
    const start = isDragging && previewDates ? previewDates.start : toDateOnly(task.start_date);
    const end = isDragging && previewDates ? previewDates.end : toDateOnly(task.end_date);
    const left = dayOffset(start) * DAY_WIDTH;
    const width = (differenceInCalendarDays(end, start) + 1) * DAY_WIDTH;
    const barWidth = Math.max(width, DAY_WIDTH);
    return { task, idx, left, barWidth, isDragging, overdue: isTaskOverdue(task) };
  });
  const layoutById = new Map(rowLayouts.map((l) => [l.task.id, l]));

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <h3 className="font-bold text-neutral-800">Cronograma</h3>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs text-neutral-500">
            {Object.values(STATUS_META).map((meta) => (
              <span key={meta.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                {meta.label}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-error-500" />
              Vencida
            </span>
          </div>
          <Button size="sm" icon={Plus} onClick={onAddTask}>
            Nueva tarea
          </Button>
        </div>
      </div>

      <TaskFilters filters={filters} onChange={onFiltersChange} members={members} totalCount={totalCount} filteredCount={tasks.length} />

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <CalendarRange className="w-10 h-10 text-neutral-300 mb-3" />
          <p className="text-neutral-500 text-sm">
            {hasAnyTasks ? 'Ningún resultado coincide con los filtros aplicados.' : 'Aún no hay tareas. Crea la primera para ver el cronograma.'}
          </p>
        </div>
      ) : (
        <div className="flex overflow-hidden">
          {/* Task info column */}
          <div className="w-72 shrink-0 border-r border-neutral-200">
            <div style={{ height: HEADER_HEIGHT }} className="border-b border-neutral-200 bg-neutral-50 flex items-center px-3">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Tarea</span>
            </div>
            {rowLayouts.map(({ task, idx, overdue }) => {
              const meta = STATUS_META[task.status];
              return (
                <button
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className={`flex flex-col justify-center w-full px-3 border-b border-neutral-100 text-left hover:bg-primary-50/60 transition-colors cursor-pointer ${
                    idx % 2 === 1 ? 'bg-neutral-50/40' : ''
                  }`}
                  style={{ height: ROW_HEIGHT }}
                >
                  <span className={`flex items-center gap-1.5 text-sm truncate font-semibold ${overdue ? 'text-error-500' : 'text-neutral-800'}`}>
                    {overdue ? (
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
                    )}
                    {task.name}
                  </span>
                  <span className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5 pl-3.5">
                    <span className={`truncate ${overdue ? 'text-error-400 font-medium' : ''}`}>
                      {format(toDateOnly(task.start_date), 'd MMM', { locale: es })} – {format(toDateOnly(task.end_date), 'd MMM', { locale: es })}
                    </span>
                    {task.assignee && (
                      <span
                        title={task.assignee.name}
                        className="w-4 h-4 rounded-full bg-primary-400 text-white flex items-center justify-center text-[9px] font-bold shrink-0"
                      >
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Timeline */}
          <div className="overflow-x-auto flex-1 no-scrollbar" ref={containerRef}>
            <div
              style={{ width: days.length * DAY_WIDTH, position: 'relative' }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* Header */}
              <div className="border-b border-neutral-200 bg-neutral-50 sticky top-0 z-10">
                <div className="flex h-6 border-b border-neutral-100">
                  {months.map((m, i) => (
                    <div
                      key={i}
                      className="shrink-0 flex items-center px-2 text-[10px] font-semibold text-neutral-500 capitalize border-r border-neutral-100 truncate"
                      style={{ width: m.span * DAY_WIDTH }}
                    >
                      {m.label}
                    </div>
                  ))}
                </div>
                <div className="flex" style={{ height: HEADER_HEIGHT - 24 }}>
                  {days.map((day, i) => (
                    <div
                      key={i}
                      className={`shrink-0 border-r border-neutral-100 flex items-center justify-center ${isWeekend(day) ? 'bg-neutral-100/70' : ''}`}
                      style={{ width: DAY_WIDTH }}
                    >
                      <span
                        className={`text-xs font-semibold ${
                          isSameDay(day, new Date()) ? 'text-white bg-secondary-500 rounded-full w-6 h-6 flex items-center justify-center' : 'text-neutral-600'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today line */}
              {todayOffset >= 0 && todayOffset < days.length && (
                <div
                  className="absolute bottom-0 w-px bg-secondary-400 z-10"
                  style={{ left: todayOffset * DAY_WIDTH + DAY_WIDTH / 2, top: HEADER_HEIGHT }}
                />
              )}

              {/* Rows */}
              {rowLayouts.map(({ task, idx, left, barWidth, isDragging, overdue }) => {
                const showLabelInside = barWidth > 70;
                const borderColor = overdue ? '#ef4444' : `${task.color}55`;
                const bgColor = overdue ? '#fee2e2' : `${task.color}22`;
                const fillColor = overdue ? '#ef4444' : task.color;

                return (
                  <div
                    key={task.id}
                    className={`relative border-b border-neutral-100 ${idx % 2 === 1 ? 'bg-neutral-50/40' : ''}`}
                    style={{ height: ROW_HEIGHT }}
                  >
                    {days.map((day, i) => (
                      <div
                        key={i}
                        className={`absolute top-0 bottom-0 border-r border-neutral-50 ${isWeekend(day) ? 'bg-neutral-50/60' : ''}`}
                        style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}
                      />
                    ))}

                    <div
                      onMouseEnter={(e) => showTooltip(e, task)}
                      onMouseLeave={() => setHover(null)}
                      className={`absolute top-2 rounded-lg shadow-sm border overflow-hidden group ${
                        isDragging ? 'ring-2 ring-primary-400 z-20 shadow-lg' : 'z-0'
                      }`}
                      style={{
                        left,
                        width: barWidth,
                        height: ROW_HEIGHT - 16,
                        backgroundColor: bgColor,
                        borderColor,
                      }}
                    >
                      <div
                        className="absolute inset-y-0 left-0 cursor-grab active:cursor-grabbing touch-none"
                        style={{ width: '100%' }}
                        onPointerDown={(e) => handlePointerDown(e, task, 'move')}
                      />
                      <div
                        className="absolute inset-y-0 left-0 opacity-90"
                        style={{ width: `${task.progress}%`, backgroundColor: fillColor }}
                      />
                      <div className="relative z-10 h-full flex items-center px-2 pointer-events-none">
                        {overdue && <AlertTriangle className="w-3 h-3 mr-1 shrink-0 text-error-600" />}
                        {showLabelInside && (
                          <span
                            className="text-[11px] font-semibold truncate"
                            style={{ color: task.progress > 50 ? '#fff' : '#262626' }}
                          >
                            {task.name}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold ml-auto shrink-0 ${task.progress > 85 ? 'text-white' : 'text-neutral-600'}`}
                        >
                          {task.progress}%
                        </span>
                      </div>
                      <div
                        className="absolute inset-y-0 left-0 w-2 cursor-ew-resize touch-none"
                        onPointerDown={(e) => handlePointerDown(e, task, 'resize-start')}
                      />
                      <div
                        className="absolute inset-y-0 right-0 w-2 cursor-ew-resize touch-none"
                        onPointerDown={(e) => handlePointerDown(e, task, 'resize-end')}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Flechas de dependencia entre tareas */}
              <svg
                className="absolute top-0 left-0 pointer-events-none overflow-visible"
                style={{ width: days.length * DAY_WIDTH, height: HEADER_HEIGHT + tasks.length * ROW_HEIGHT }}
              >
                <defs>
                  <marker id="gantt-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8" />
                  </marker>
                </defs>
                {rowLayouts.map((curr) => {
                  if (!curr.task.depends_on_task_id) return null;
                  const pred = layoutById.get(curr.task.depends_on_task_id);
                  if (!pred) return null;

                  const startX = pred.left + pred.barWidth;
                  const startY = HEADER_HEIGHT + pred.idx * ROW_HEIGHT + ROW_HEIGHT / 2;
                  const endX = curr.left;
                  const endY = HEADER_HEIGHT + curr.idx * ROW_HEIGHT + ROW_HEIGHT / 2;
                  const midX = Math.max(startX + 12, endX - 12);

                  const path = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX - 1} ${endY}`;

                  return <path key={curr.task.id} d={path} stroke="#94a3b8" strokeWidth="1.5" fill="none" markerEnd="url(#gantt-arrow)" />;
                })}
              </svg>
            </div>
          </div>
        </div>
      )}

      {hover && (
        <div
          className="fixed z-50 w-64 pointer-events-none animate-fade-in"
          style={{ left: Math.max(12, hover.x - 128), top: Math.max(12, hover.y - 12), transform: 'translateY(-100%)' }}
        >
          <div className="bg-neutral-900 text-white rounded-lg shadow-xl p-3 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-sm">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_META[hover.task.status].color }} />
              {hover.task.name}
              {isTaskOverdue(hover.task) && (
                <span className="flex items-center gap-1 text-error-400 text-[10px] font-bold ml-1">
                  <AlertTriangle className="w-3 h-3" /> VENCIDA
                </span>
              )}
            </div>
            <p className="text-neutral-300">
              {fmtShort(toDateOnly(hover.task.start_date))} – {fmtShort(toDateOnly(hover.task.end_date))}
            </p>
            <p className="text-neutral-300">
              Estado: <span className="text-white">{STATUS_META[hover.task.status].label}</span> · Progreso:{' '}
              <span className="text-white">{hover.task.progress}%</span>
            </p>
            {hover.task.assignee && <p className="text-neutral-300">Responsable: <span className="text-white">{hover.task.assignee.name}</span></p>}
            <p className="text-neutral-300 border-t border-white/10 pt-1.5 mt-1.5">
              {hover.task.description || <span className="italic text-neutral-500">Sin descripción</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
