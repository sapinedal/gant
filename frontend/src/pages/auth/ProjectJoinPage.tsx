import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Users, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../lib/services/projectService';
import { extractErrorMessage } from '../../lib/api';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Logo from '../../components/Logo';

interface ProjectPreview {
  id: number;
  name: string;
  description: string | null;
  owner_name: string;
  status: string;
  is_member: boolean;
}

export default function ProjectJoinPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!inviteCode) return;
    setIsLoading(true);
    projectService
      .previewInvite(inviteCode)
      .then(setProject)
      .catch((err) => {
        toast.error('No se pudo cargar la vista previa del proyecto.');
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, [inviteCode]);

  async function handleJoin() {
    if (!inviteCode) return;
    setIsJoining(true);
    try {
      const res = await projectService.joinProject(inviteCode);
      toast.success(res.message);
      navigate(`/projects/${res.project_id}`);
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo unir al proyecto.'));
    } finally {
      setIsJoining(false);
    }
  }

  function handleSaveRedirect() {
    sessionStorage.setItem('redirect_to', window.location.pathname);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md animate-fade-in text-center">
        <Logo size={56} rounded={16} className="mb-4 mx-auto shadow-md" />

        {isLoading && <p className="text-neutral-500 text-sm">Cargando información del proyecto...</p>}

        {!isLoading && !project && (
          <div className="bg-white border border-neutral-200 rounded-xl shadow-md p-6">
            <p className="text-neutral-500 text-sm">El enlace de invitación no es válido o ha expirado.</p>
            <div className="mt-4">
              <Link to="/projects">
                <Button variant="outline" className="w-full">
                  Ir a mis proyectos
                </Button>
              </Link>
            </div>
          </div>
        )}

        {project && (
          <div className="bg-white border border-neutral-200 rounded-xl shadow-md p-6 text-left">
            <div className="flex items-center gap-2 mb-3 justify-center">
              <Users className="w-8 h-8 text-primary-500" />
            </div>
            <h1 className="text-xl font-bold text-neutral-800 text-center">
              Invitación a Proyecto
            </h1>
            <p className="text-sm text-neutral-500 text-center mt-1">
              Te han invitado a unirte a un espacio de trabajo colaborativo.
            </p>

            <div className="mt-6 border border-neutral-100 rounded-lg p-4 bg-neutral-50 space-y-3">
              <div>
                <h3 className="text-xs font-semibold uppercase text-neutral-400">Proyecto</h3>
                <p className="font-semibold text-neutral-800 text-base">{project.name}</p>
              </div>

              {project.description && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-neutral-400">Descripción</h3>
                  <p className="text-sm text-neutral-600 line-clamp-3">{project.description}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-1 border-t border-neutral-200/60">
                <div>
                  <h3 className="text-xs font-semibold uppercase text-neutral-400">Creado por</h3>
                  <p className="text-sm text-neutral-700 font-medium">{project.owner_name}</p>
                </div>
                <Badge variant="primary">{project.status}</Badge>
              </div>
            </div>

            {project.is_member ? (
              <div className="mt-6 space-y-2">
                <p className="text-sm text-center text-secondary-600 font-semibold">
                  ✓ Ya eres miembro de este proyecto.
                </p>
                <Link to={`/projects/${project.id}`}>
                  <Button className="w-full">Ir al proyecto</Button>
                </Link>
              </div>
            ) : (
              <div className="mt-6">
                {user ? (
                  <Button className="w-full" onClick={handleJoin} isLoading={isJoining}>
                    Unirse al proyecto
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-500 text-center">
                      Para unirte y colaborar en este proyecto, necesitas ingresar a tu cuenta de Trazalo Gantt.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Link to="/login" onClick={handleSaveRedirect}>
                        <Button variant="outline" className="w-full" icon={LogIn}>
                          Iniciar sesión
                        </Button>
                      </Link>
                      <Link to="/register" onClick={handleSaveRedirect}>
                        <Button className="w-full" icon={UserPlus}>
                          Registrarse
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
