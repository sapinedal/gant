import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { projectService } from '../../lib/services/projectService';
import { extractErrorMessage } from '../../lib/api';
import type { Role } from '../../types';
import { Mail, Link as LinkIcon, Copy, RefreshCw, Check, Globe } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

export default function InviteMemberModal({ isOpen, onClose, projectId }: InviteMemberModalProps) {
  // Pestañas: 'email' o 'link'
  const [activeTab, setActiveTab] = useState<'email' | 'link'>('email');
  
  // Estado para pestaña de Correo
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('editor');
  const [isSending, setIsSending] = useState(false);

  // Estado para pestaña de Enlace
  const [inviteCode, setInviteCode] = useState('');
  const [inviteEnabled, setInviteEnabled] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingProject(true);
    projectService
      .get(projectId)
      .then((p) => {
        setInviteCode(p.invite_code || '');
        setInviteEnabled(p.invite_enabled ?? false);
      })
      .catch((err) => toast.error(extractErrorMessage(err, 'No se pudo cargar la configuración de invitación.')))
      .finally(() => setIsLoadingProject(false));
  }, [isOpen, projectId]);

  async function handleSubmitEmail(e: React.FormEvent) {
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

  async function handleToggleInviteLink() {
    setIsToggling(true);
    try {
      if (inviteEnabled) {
        const res = await projectService.disableInviteLink(projectId);
        setInviteEnabled(res.invite_enabled);
        toast.success('Enlace de invitación desactivado.');
      } else {
        const res = await projectService.enableInviteLink(projectId);
        setInviteEnabled(res.invite_enabled);
        setInviteCode(res.invite_code);
        toast.success('Enlace de invitación activado.');
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo modificar el enlace de invitación.'));
    } finally {
      setIsToggling(false);
    }
  }

  async function handleResetInviteLink() {
    if (!confirm('¿Estás seguro de regenerar el enlace de invitación? El enlace actual dejará de funcionar.')) return;
    setIsToggling(true);
    try {
      const res = await projectService.resetInviteLink(projectId);
      setInviteEnabled(res.invite_enabled);
      setInviteCode(res.invite_code);
      toast.success('Enlace de invitación regenerado.');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo regenerar el enlace.'));
    } finally {
      setIsToggling(false);
    }
  }

  function handleCopy() {
    const inviteUrl = `${window.location.origin}/join/project/${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success('Enlace copiado al portapapeles.');
    setTimeout(() => setCopied(false), 2000);
  }

  const inviteUrl = `${window.location.origin}/join/project/${inviteCode}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invitar al proyecto">
      <div className="flex border-b border-neutral-100 mb-4">
        <button
          className={`flex-1 py-2 text-center text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'email'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
          onClick={() => setActiveTab('email')}
        >
          <span className="flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" /> Correo
          </span>
        </button>
        <button
          className={`flex-1 py-2 text-center text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'link'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
          onClick={() => setActiveTab('link')}
        >
          <span className="flex items-center justify-center gap-2">
            <LinkIcon className="w-4 h-4" /> Enlace Público
          </span>
        </button>
      </div>

      {activeTab === 'email' && (
        <form onSubmit={handleSubmitEmail} className="space-y-4">
          <Input
            label="Correo electrónico"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colega@empresa.com"
          />
          <Select
            label="Rol de invitación"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            options={[
              { value: 'viewer', label: 'Solo lectura (Viewer)' },
              { value: 'editor', label: 'Editor (puede crear y asignarse tareas)' },
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
      )}

      {activeTab === 'link' && (
        <div className="space-y-4">
          {isLoadingProject ? (
            <p className="text-neutral-500 text-sm py-4 text-center">Cargando configuración...</p>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <div className="flex items-center gap-3">
                  <Globe className={`w-5 h-5 ${inviteEnabled ? 'text-primary-500' : 'text-neutral-400'}`} />
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-800">
                      Unirse mediante enlace
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      {inviteEnabled
                        ? 'Cualquier persona con el enlace puede unirse como Editor.'
                        : 'El enlace está inactivo. Nadie podrá unirse.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleInviteLink}
                  disabled={isToggling}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                    inviteEnabled ? 'bg-primary-500 justify-end' : 'bg-neutral-300 justify-start'
                  }`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {inviteEnabled && inviteCode && (
                <div className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteUrl}
                      className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-xs bg-neutral-50 text-neutral-600 focus:outline-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      icon={copied ? Check : Copy}
                      onClick={handleCopy}
                    >
                      {copied ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={handleResetInviteLink}
                      disabled={isToggling}
                      className="flex items-center gap-1.5 text-xs text-error-500 hover:text-error-600 hover:underline font-semibold"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerar enlace
                    </button>

                    <Button type="button" variant="outline" onClick={onClose}>
                      Cerrar
                    </Button>
                  </div>
                </div>
              )}

              {!inviteEnabled && (
                <div className="flex justify-end pt-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cerrar
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
