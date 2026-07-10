import { useState } from 'react';
import { toast } from 'sonner';
import { KeyRound, User as UserIcon } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../lib/services/profileService';
import { extractErrorMessage } from '../../lib/api';

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<{ name?: string; email?: string }>({});

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{ current_password?: string; password?: string }>({});

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileErrors({});
    setIsSavingProfile(true);
    try {
      const updated = await profileService.update({ name, email });
      setUser(updated);
      toast.success('Perfil actualizado.');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo actualizar el perfil.'));
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordErrors({});
    if (newPassword !== confirmPassword) {
      setPasswordErrors({ password: 'Las contraseñas no coinciden.' });
      return;
    }
    setIsSavingPassword(true);
    try {
      await profileService.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast.success('Contraseña actualizada.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo actualizar la contraseña.'));
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <div>
      <PageHeader title="Mi perfil" description="Actualiza tu información personal y tu contraseña." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">
        <Card padding="none">
          <CardHeader className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-primary-500" />
            <CardTitle>Información personal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Input label="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} error={profileErrors.name} />
              <Input label="Correo electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={profileErrors.email} />
              <div className="flex justify-end">
                <Button type="submit" isLoading={isSavingProfile}>
                  Guardar cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card padding="none">
          <CardHeader className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary-500" />
            <CardTitle>Cambiar contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Contraseña actual"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={passwordErrors.current_password}
              />
              <Input
                label="Nueva contraseña"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={passwordErrors.password}
              />
              <Input label="Confirmar nueva contraseña" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <div className="flex justify-end">
                <Button type="submit" isLoading={isSavingPassword}>
                  Actualizar contraseña
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
