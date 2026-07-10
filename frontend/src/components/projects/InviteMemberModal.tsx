import { useState } from 'react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { projectService } from '../../lib/services/projectService';
import { extractErrorMessage } from '../../lib/api';
import type { Role } from '../../types';
import { Mail } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

export default function InviteMemberModal({ isOpen, onClose, projectId }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('editor');
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSending(true);
    try {
      await projectService.invite(projectId, { email, role });
      toast.success(`Invitación enviada a ${email}.`);
      setEmail('');
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo enviar la invitación.'));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invitar miembro">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Correo electrónico"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colega@empresa.com"
        />
        <Select
          label="Rol"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          options={[
            { value: 'viewer', label: 'Solo lectura' },
            { value: 'editor', label: 'Editor' },
            { value: 'owner', label: 'Propietario' },
          ]}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" icon={Mail} isLoading={isSending}>
            Enviar invitación
          </Button>
        </div>
      </form>
    </Modal>
  );
}
