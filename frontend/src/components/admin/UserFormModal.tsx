import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { userAdminService } from '../../lib/services/userAdminService';
import { extractErrorMessage } from '../../lib/api';
import type { User } from '../../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSaved: (user: User) => void;
}

export default function UserFormModal({ isOpen, onClose, user, onSaved }: UserFormModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setPassword('');
    setIsAdmin(user?.is_admin ?? false);
  }, [isOpen, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user && password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setIsSaving(true);
    try {
      const saved = user
        ? await userAdminService.update(user.id, { name, email, is_admin: isAdmin, ...(password ? { password } : {}) })
        : await userAdminService.create({ name, email, is_admin: isAdmin, password });
      toast.success(user ? 'Usuario actualizado.' : 'Usuario creado.');
      onSaved(saved);
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo guardar el usuario.'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Editar usuario' : 'Nuevo usuario'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ana Torres" />
        <Input label="Correo electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ana@empresa.com" />
        <Input
          label={user ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={user ? 'Dejar en blanco para no cambiarla' : '••••••••'}
        />
        <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
          <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="accent-primary-500 w-4 h-4" />
          Es administrador
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSaving}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
