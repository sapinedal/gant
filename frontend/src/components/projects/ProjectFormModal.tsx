import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { projectService } from '../../lib/services/projectService';
import { extractErrorMessage } from '../../lib/api';
import type { Project } from '../../types';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSaved: (project: Project) => void;
}

export default function ProjectFormModal({ isOpen, onClose, project, onSaved }: ProjectFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(project?.name ?? '');
    setDescription(project?.description ?? '');
  }, [isOpen, project]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre es requerido.');
      return;
    }
    setIsSaving(true);
    try {
      const saved = project
        ? await projectService.update(project.id, { name, description })
        : await projectService.create({ name, description });
      toast.success(project ? 'Proyecto actualizado.' : 'Proyecto creado.');
      onSaved(saved);
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo guardar el proyecto.'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Editar proyecto' : 'Nuevo proyecto'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Lanzamiento App Móvil" />
        <Textarea label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Opcional" />
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
