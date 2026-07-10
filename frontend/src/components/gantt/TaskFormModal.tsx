import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { taskService } from '../../lib/services/taskService';
import { extractErrorMessage } from '../../lib/api';
import type { Task, User } from '../../types';
import { Trash2 } from 'lucide-react';
import TaskComments from './TaskComments';

const COLORS = ['#223A7C', '#00A99D', '#577BDE', '#f59e0b', '#ef4444', '#8b5cf6'];

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  members: User[];
  otherTasks: Task[];
  task: Task | null;
  onSaved: (task: Task) => void;
  onDeleted: (taskId: number) => void;
  canModerateComments?: boolean;
}

export default function TaskFormModal({
  isOpen,
  onClose,
  projectId,
  members,
  otherTasks,
  task,
  onSaved,
  onDeleted,
  canModerateComments = false,
}: TaskFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('pending');
  const [color, setColor] = useState(COLORS[0]);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dependsOn, setDependsOn] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(task?.name ?? '');
    setDescription(task?.description ?? '');
    const todayLocal = format(new Date(), 'yyyy-MM-dd');
    setStartDate(task?.start_date?.slice(0, 10) ?? todayLocal);
    setEndDate(task?.end_date?.slice(0, 10) ?? todayLocal);
    setProgress(task?.progress ?? 0);
    setStatus(task?.status ?? 'pending');
    setColor(task?.color ?? COLORS[0]);
    setAssigneeId(task?.assignee_id ? String(task.assignee_id) : '');
    setDependsOn(task?.depends_on_task_id ? String(task.depends_on_task_id) : '');
  }, [isOpen, task]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre es requerido.');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name,
        description: description || null,
        start_date: startDate,
        end_date: endDate,
        progress,
        status,
        color,
        assignee_id: assigneeId ? Number(assigneeId) : null,
        depends_on_task_id: dependsOn ? Number(dependsOn) : null,
      };
      const saved = task ? await taskService.update(task.id, payload) : await taskService.create(projectId, payload);
      toast.success(task ? 'Tarea actualizada.' : 'Tarea creada.');
      onSaved(saved);
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo guardar la tarea.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    if (!confirm(`¿Eliminar la tarea "${task.name}"?`)) return;
    try {
      await taskService.remove(task.id);
      toast.success('Tarea eliminada.');
      onDeleted(task.id);
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo eliminar la tarea.'));
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Editar tarea' : 'Nueva tarea'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Diseño de wireframes" />
        <Textarea label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Fecha inicio" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="Fecha fin" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Estado"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'pending', label: 'Pendiente' },
              { value: 'in_progress', label: 'En progreso' },
              { value: 'completed', label: 'Completada' },
            ]}
          />
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Progreso ({progress}%)</label>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-primary-500 mt-3"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Responsable"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            options={[{ value: '', label: 'Sin asignar' }, ...members.map((m) => ({ value: String(m.id), label: m.name }))]}
          />
          <Select
            label="Depende de"
            value={dependsOn}
            onChange={(e) => setDependsOn(e.target.value)}
            options={[{ value: '', label: 'Ninguna' }, ...otherTasks.map((t) => ({ value: String(t.id), label: t.name }))]}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Color</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-neutral-400 scale-110' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {task && (
          <div className="pt-2 border-t border-neutral-100">
            <TaskComments taskId={task.id} canModerate={canModerateComments} />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {task ? (
            <Button type="button" variant="ghost" icon={Trash2} onClick={handleDelete} className="text-error-500">
              Eliminar
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Guardar
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
