import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { invitationService } from '../../lib/services/invitationService';
import { extractErrorMessage } from '../../lib/api';
import type { InvitationPreview } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Logo from '../../components/Logo';

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<InvitationPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (!token) return;
    invitationService
      .preview(token)
      .then(setInvitation)
      .catch(() => toast.error('No se pudo cargar la invitación.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  async function handleAccept() {
    if (!token) return;
    setIsAccepting(true);
    try {
      const res = await invitationService.accept(token);
      toast.success(res.message);
      navigate(`/projects/${res.project_id}`);
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo aceptar la invitación.'));
    } finally {
      setIsAccepting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm animate-fade-in text-center">
        <Logo size={56} rounded={16} className="mb-4 mx-auto shadow-md" />

        {isLoading && <p className="text-neutral-500">Cargando invitación...</p>}

        {!isLoading && !invitation && <p className="text-neutral-500">Invitación no encontrada.</p>}

        {invitation && (
          <div className="bg-white border border-neutral-200 rounded-xl shadow-md p-6">
            <Mail className="w-8 h-8 text-primary-400 mx-auto mb-3" />
            <h1 className="text-lg font-bold text-neutral-800">
              {invitation.inviter_name} te invitó a <span className="text-primary-500">{invitation.project_name}</span>
            </h1>
            <p className="text-sm text-neutral-500 mt-2">
              Rol: <Badge variant="primary">{invitation.role}</Badge>
            </p>

            {invitation.accepted && <p className="mt-4 text-sm text-secondary-600 font-medium">Ya aceptaste esta invitación.</p>}
            {invitation.expired && !invitation.accepted && <p className="mt-4 text-sm text-error-500 font-medium">Esta invitación expiró.</p>}

            {!invitation.accepted && !invitation.expired && (
              <div className="mt-5">
                {user ? (
                  <Button className="w-full" onClick={handleAccept} isLoading={isAccepting}>
                    Aceptar invitación
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-neutral-500 mb-2">Inicia sesión o crea una cuenta con {invitation.email} para continuar.</p>
                    <Link to="/login">
                      <Button className="w-full">Iniciar sesión</Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="outline" className="w-full">
                        Crear cuenta
                      </Button>
                    </Link>
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
