import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, ShieldCheck, Trash2, Users as UsersIcon } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import UserFormModal from '../../components/admin/UserFormModal';
import { userAdminService } from '../../lib/services/userAdminService';
import { extractErrorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  function loadUsers() {
    setIsLoading(true);
    userAdminService
      .list()
      .then(setUsers)
      .catch((error) => toast.error(extractErrorMessage(error, 'No se pudieron cargar los usuarios.')))
      .finally(() => setIsLoading(false));
  }

  function openNew() {
    setSelectedUser(null);
    setIsModalOpen(true);
  }

  function openEdit(user: User) {
    setSelectedUser(user);
    setIsModalOpen(true);
  }

  function handleSaved(user: User) {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      return exists ? prev.map((u) => (u.id === user.id ? user : u)) : [...prev, user].sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  async function handleDelete(user: User) {
    if (!confirm(`¿Eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await userAdminService.remove(user.id);
      toast.success('Usuario eliminado.');
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo eliminar el usuario.'));
    }
  }

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Administra las cuentas que pueden ingresar a Trazalo Gantt."
        actions={
          <Button icon={Plus} onClick={openNew}>
            Nuevo usuario
          </Button>
        }
      />

      {isLoading && <p className="text-neutral-500 text-sm">Cargando usuarios...</p>}

      {!isLoading && (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Correo</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Proyectos</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-neutral-100 hover:bg-neutral-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-400 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-neutral-800">{user.name}</span>
                        {user.id === currentUser?.id && <span className="text-[10px] text-neutral-400">(tú)</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{user.email}</td>
                    <td className="px-4 py-3">
                      {user.is_admin ? (
                        <Badge variant="primary">
                          <ShieldCheck className="w-3 h-3 mr-1 inline" /> Administrador
                        </Badge>
                      ) : (
                        <Badge variant="neutral">Miembro</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{user.owned_projects_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" icon={Pencil} iconOnly onClick={() => openEdit(user)} />
                        {user.id !== currentUser?.id && (
                          <Button variant="ghost" size="sm" icon={Trash2} iconOnly className="text-error-500" onClick={() => handleDelete(user)} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UsersIcon className="w-10 h-10 text-neutral-300 mb-3" />
              <p className="text-neutral-500 text-sm">No hay usuarios registrados.</p>
            </div>
          )}
        </Card>
      )}

      <UserFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={selectedUser} onSaved={handleSaved} />
    </div>
  );
}
