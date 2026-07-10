import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../lib/api';

const schema = z
  .object({
    name: z.string().min(2, 'Ingresa tu nombre completo'),
    email: z.string().email('Correo inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      await registerUser(values.name, values.email, values.password, values.password_confirmation);
      navigate('/projects');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo crear la cuenta.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <Logo size={56} rounded={16} className="mb-3 shadow-md" />
          <h1 className="text-xl font-bold text-neutral-800">Crea tu cuenta</h1>
          <p className="text-sm text-neutral-500 mt-1">Comienza a organizar tus proyectos</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-neutral-200 rounded-xl shadow-md p-6 space-y-4">
          <Input label="Nombre completo" placeholder="Ana Torres" error={errors.name?.message} {...register('name')} />
          <Input label="Correo electrónico" type="email" placeholder="tucorreo@empresa.com" error={errors.email?.message} {...register('email')} />
          <Input label="Contraseña" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
          <Input
            label="Confirmar contraseña"
            type="password"
            placeholder="••••••••"
            error={errors.password_confirmation?.message}
            {...register('password_confirmation')}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Crear cuenta
          </Button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary-500 font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
