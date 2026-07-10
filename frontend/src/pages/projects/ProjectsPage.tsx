import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FolderKanban, Plus, Users } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ProjectFormModal from '../../components/projects/ProjectFormModal';
import { projectService } from '../../lib/services/projectService';
import { extractErrorMessage } from '../../lib/api';
import type { Project, ProjectStatus } from '../../types';

const statusLabels: Record<ProjectStatus, string> = {
  planning: 'Planeación',
  active: 'Activo',
  on_hold: 'En pausa',
  completed: 'Completado',
};

const statusVariant: Record<ProjectStatus, 'neutral' | 'success' | 'warning' | 'secondary'> = {
  planning: 'neutral',
  active: 'success',
  on_hold: 'warning',
  completed: 'secondary',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  function loadProjects() {
    setIsLoading(true);
    projectService
      .list()
      .then(setProjects)
      .catch((error) => toast.error(extractErrorMessage(error, 'No se pudieron cargar los proyectos.')))
      .finally(() => setIsLoading(false));
  }

  return (
    <div>
      <PageHeader
        title="Proyectos"
        description="Organiza y da seguimiento a tus proyectos con cronogramas tipo Gantt."
        actions={
          <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
            Nuevo proyecto
          </Button>
        }
      />

      {isLoading && <p className="text-neutral-500 text-sm">Cargando proyectos...</p>}

      {!isLoading && projects.length === 0 && (
        <Card className="text-center py-12">
          <FolderKanban className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500">Aún no tienes proyectos. Crea el primero para empezar.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="cursor-pointer animate-fade-in"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${project.color}20` }}>
                <FolderKanban className="w-5 h-5" style={{ color: project.color }} />
              </div>
              <Badge variant={statusVariant[project.status]}>{statusLabels[project.status]}</Badge>
            </div>
            <h3 className="font-bold text-neutral-800 truncate">{project.name}</h3>
            <p className="text-sm text-neutral-500 mt-1 line-clamp-2 min-h-[2.5rem]">{project.description || 'Sin descripción'}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {project.owner?.name ?? 'Tú'}
              </span>
              <span>{project.tasks_count ?? 0} tareas</span>
            </div>
          </Card>
        ))}
      </div>

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={(project) => setProjects((prev) => [project, ...prev])}
      />
    </div>
  );
}
