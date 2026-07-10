import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Pencil, Trash2, UserPlus, Users } from 'lucide-react';
import { projectService } from '../../lib/services/projectService';
import { taskService } from '../../lib/services/taskService';
import { extractErrorMessage } from '../../lib/api';
import type { Project, Task, User } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import GanttChart from '../../components/gantt/GanttChart';
import TaskFormModal from '../../components/gantt/TaskFormModal';
import type { TaskFilterState } from '../../components/gantt/TaskFilters';
import ProjectFormModal from '../../components/projects/ProjectFormModal';
import InviteMemberModal from '../../components/projects/InviteMemberModal';
import { useAuth } from '../../context/AuthContext';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilterState>({ search: '', status: '', assigneeId: '' });

  useEffect(() => {
    if (!projectId) return;
    setIsLoading(true);
    Promise.all([projectService.get(projectId), projectService.members(projectId), taskService.list(projectId)])
      .then(([p, m, t]) => {
        setProject(p);
        setMembers(m);
        setTasks(t);
      })
      .catch((error) => toast.error(extractErrorMessage(error, 'No se pudo cargar el proyecto.')))
      .finally(() => setIsLoading(false));
  }, [projectId]);

  function openNewTask() {
    setSelectedTask(null);
    setTaskModalOpen(true);
  }

  function openEditTask(task: Task) {
    setSelectedTask(task);
    setTaskModalOpen(true);
  }

  function handleTaskSaved(task: Task) {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      return exists ? prev.map((t) => (t.id === task.id ? task : t)) : [...prev, task];
    });
  }

  function handleTaskDeleted(taskId: number) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  async function handleTaskDateChange(taskId: number, dates: { start_date: string; end_date: string }) {
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...dates } : t)));
    try {
      await taskService.update(taskId, dates);
    } catch (error) {
      setTasks(previous);
      toast.error(extractErrorMessage(error, 'No se pudo actualizar la tarea.'));
    }
  }

  async function handleDeleteProject() {
    if (!project) return;
    if (!confirm(`¿Eliminar el proyecto "${project.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await projectService.remove(project.id);
      toast.success('Proyecto eliminado.');
      navigate('/projects');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo eliminar el proyecto.'));
    }
  }

  if (isLoading) return <p className="text-neutral-500 text-sm">Cargando proyecto...</p>;
  if (!project) return <p className="text-neutral-500 text-sm">Proyecto no encontrado.</p>;

  const isOwner = project.owner_id === user?.id;

  const filteredTasks = tasks.filter((t) => {
    if (filters.search && !t.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.status && t.status !== filters.status) return false;
    if (filters.assigneeId && String(t.assignee_id ?? '') !== filters.assigneeId) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/projects')} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-500">
        <ArrowLeft className="w-4 h-4" /> Volver a proyectos
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-800">{project.name}</h1>
            <Badge variant="primary">{project.status}</Badge>
          </div>
          <p className="text-sm text-neutral-500 mt-1">{project.description || 'Sin descripción'}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={UserPlus} onClick={() => setInviteOpen(true)}>
            Invitar
          </Button>
          {isOwner && (
            <>
              <Button variant="ghost" size="sm" icon={Pencil} iconOnly onClick={() => setEditProjectOpen(true)} />
              <Button variant="ghost" size="sm" icon={Trash2} iconOnly className="text-error-500" onClick={handleDeleteProject} />
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-neutral-400" />
        <div className="flex -space-x-2">
          {members.map((m) => (
            <div
              key={m.id}
              title={m.name}
              className="w-7 h-7 rounded-full bg-primary-400 text-white text-xs font-semibold flex items-center justify-center border-2 border-white"
            >
              {m.name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
        <span className="text-xs text-neutral-400">
          {members.length} miembro{members.length !== 1 ? 's' : ''}
        </span>
      </div>

      <GanttChart
        tasks={filteredTasks}
        onTaskClick={openEditTask}
        onTaskChange={handleTaskDateChange}
        onAddTask={openNewTask}
        hasAnyTasks={tasks.length > 0}
        filters={filters}
        onFiltersChange={setFilters}
        members={members}
        totalCount={tasks.length}
      />

      <TaskFormModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        projectId={project.id}
        members={members}
        otherTasks={tasks.filter((t) => t.id !== selectedTask?.id)}
        task={selectedTask}
        onSaved={handleTaskSaved}
        onDeleted={handleTaskDeleted}
        canModerateComments={isOwner}
      />

      <ProjectFormModal
        isOpen={editProjectOpen}
        onClose={() => setEditProjectOpen(false)}
        project={project}
        onSaved={(p) => setProject(p)}
      />

      <InviteMemberModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} projectId={project.id} />
    </div>
  );
}
