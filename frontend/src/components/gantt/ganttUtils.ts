import type { TaskStatus } from '../../types';

export const STATUS_META: Record<TaskStatus, { label: string; color: string; dot: string }> = {
  pending: { label: 'Pendiente', color: '#a3a3a3', dot: 'bg-neutral-400' },
  in_progress: { label: 'En progreso', color: '#577BDE', dot: 'bg-primary-400' },
  completed: { label: 'Completada', color: '#10b981', dot: 'bg-emerald-500' },
};

/**
 * Convierte un string de fecha (ej. "2026-07-10" o con hora ISO) en un Date local
 * a medianoche. `new Date("2026-07-10")` se interpretaría como UTC y podría
 * desplazarse un día en zonas horarias detrás de UTC, así que parseamos
 * los componentes manualmente para anclarla a la fecha local.
 */
export function toDateOnly(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}
