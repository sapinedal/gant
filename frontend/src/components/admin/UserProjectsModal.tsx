import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FolderKanban, Plus, UserMinus, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { userAdminService } from '../../lib/services/userAdminService';
import { extractErrorMessage } from '../../lib/api';
import type { User, Role } from '../../types';

interface UserProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

interface UserProjectRelation {
  id: number;
  name: string;
  pivot: {
    role: Role;
  };
}

export default function UserProjectsModal({ isOpen, onClose, user }: UserProjectsModalProps) {
  const [userProjects, setUserProjects] = useState<UserProjectRelation[]>([]);
  const [allProjects, setAllProjects] = useState<{ id: number; name: string }[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<Role>('editor');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    loadData();
  }, [isOpen, user]);

  async function loadData() {
    if (!user) return;
    setIsLoading(true);
    try {
      const [uProjects, systemProjects] = await Promise.all([
        userAdminService.getUserProjects(user.id),
        userAdminService.getAllProjects(),
      ]);
      setUserProjects(uProjects);
      setAllProjects(systemProjects);
      setSelectedProjectId('');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo cargar la información de proyectos.'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAttach(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedProjectId) return;
    setIsSaving(true);
    try {
      await userAdminService.attachProjectToUser(user.id, Number(selectedProjectId), selectedRole);
      toast.success('Usuario asociado al proyecto correctamente.');
      await loadData();
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo asociar al proyecto.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRoleChange(projectId: number, newRole: Role) {
    if (!user) return;
    try {
      await userAdminService.updateUserProjectRole(user.id, projectId, newRole);
      toast.success('Rol actualizado.');
      setUserProjects((prev) =>
        prev.map((up) => (up.id === projectId ? { ...up, pivot: { ...up.pivot, role: newRole } } : up))
      );
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo actualizar el rol.'));
    }
  }

  async function handleDetach(projectId: number, projectName: string) {
    if (!user) return;
    if (!confirm(`¿Desvincular a "${user.name}" del proyecto "${projectName}"?`)) return;
    try {
      await userAdminService.detachProjectFromUser(user.id, projectId);
      toast.success('Usuario desvinculado del proyecto.');
      setUserProjects((prev) => prev.filter((up) => up.id !== projectId));
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo desvincular del proyecto.'));
    }
  }

  // Filtrar proyectos del sistema para mostrar solo los que el usuario NO pertenece
  const availableProjects = allProjects.filter(
    (sp) => !userProjects.some((up) => up.id === sp.id)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Proyectos de ${user?.name || ''}`} size="lg">
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-sm text-neutral-500 mt-2">Cargando proyectos...</p>
          </div>
        ) : (
          <>
            {/* Lista de Proyectos Actuales */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-1.5">
                <FolderKanban className="w-4 h-4 text-neutral-400" />
                Membresía de Proyectos ({userProjects.length})
              </h3>

              {userProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 border border-dashed border-neutral-200 rounded-xl text-center">
                  <AlertCircle className="w-8 h-8 text-neutral-300 mb-2" />
                  <p className="text-sm text-neutral-500">Este usuario no pertenece a ningún proyecto.</p>
                </div>
              ) : (
                <div className="border border-neutral-100 rounded-lg overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-100 text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                        <th className="px-4 py-2">Proyecto</th>
                        <th className="px-4 py-2 w-48">Rol</th>
                        <th className="px-4 py-2 w-16" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {userProjects.map((project) => (
                        <tr key={project.id} className="hover:bg-neutral-50/40">
                          <td className="px-4 py-3.5 font-medium text-neutral-800">
                            {project.name}
                          </td>
                          <td className="px-4 py-3.5">
                            <select
                              value={project.pivot.role}
                              onChange={(e) => handleRoleChange(project.id, e.target.value as Role)}
                              className="w-full text-xs border border-neutral-200 rounded px-2 py-1 bg-white text-neutral-700 focus:outline-none focus:border-primary-500"
                            >
                              <option value="viewer">Solo lectura (Viewer)</option>
                              <option value="editor">Editor</option>
                              <option value="owner">Propietario (Owner)</option>
                            </select>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              type="button"
                              title="Desvincular del proyecto"
                              onClick={() => handleDetach(project.id, project.name)}
                              className="text-neutral-400 hover:text-error-500 transition-colors p-1"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Formulario para Asociar a Nuevo Proyecto */}
            <div className="border-t border-neutral-100 pt-6">
              <h3 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-neutral-400" />
                Asociar a un nuevo proyecto
              </h3>

              {availableProjects.length === 0 ? (
                <p className="text-xs text-neutral-500 italic bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                  Este usuario ya pertenece a todos los proyectos del sistema.
                </p>
              ) : (
                <form onSubmit={handleAttach} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-6">
                    <Select
                      label="Seleccionar Proyecto"
                      required
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      options={[
                        { value: '', label: 'Selecciona un proyecto...' },
                        ...availableProjects.map((ap) => ({ value: String(ap.id), label: ap.name })),
                      ]}
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <Select
                      label="Rol en el Proyecto"
                      required
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as Role)}
                      options={[
                        { value: 'viewer', label: 'Solo lectura (Viewer)' },
                        { value: 'editor', label: 'Editor' },
                        { value: 'owner', label: 'Propietario (Owner)' },
                      ]}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button
                      type="submit"
                      className="w-full flex justify-center py-2.5"
                      isLoading={isSaving}
                      disabled={!selectedProjectId}
                    >
                      Asociar
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end pt-4 border-t border-neutral-100">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
