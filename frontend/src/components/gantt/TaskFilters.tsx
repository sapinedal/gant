import { Search } from 'lucide-react';
import Select from '../ui/Select';
import { STATUS_META } from './ganttUtils';
import type { User } from '../../types';

export interface TaskFilterState {
  search: string;
  status: string;
  assigneeId: string;
}

interface TaskFiltersProps {
  filters: TaskFilterState;
  onChange: (filters: TaskFilterState) => void;
  members: User[];
  totalCount: number;
  filteredCount: number;
}

export default function TaskFilters({ filters, onChange, members, totalCount, filteredCount }: TaskFiltersProps) {
  const hasActiveFilters = filters.search !== '' || filters.status !== '' || filters.assigneeId !== '';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-neutral-100 bg-neutral-50/60">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Buscar tarea..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400"
        />
      </div>

      <div className="w-full sm:w-40">
        <Select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          options={[
            { value: '', label: 'Todos los estados' },
            ...Object.entries(STATUS_META).map(([value, meta]) => ({ value, label: meta.label })),
          ]}
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          value={filters.assigneeId}
          onChange={(e) => onChange({ ...filters, assigneeId: e.target.value })}
          options={[{ value: '', label: 'Todos los responsables' }, ...members.map((m) => ({ value: String(m.id), label: m.name }))]}
        />
      </div>

      <div className="text-xs text-neutral-400 whitespace-nowrap sm:ml-auto">
        {hasActiveFilters ? (
          <>
            {filteredCount} de {totalCount} tareas ·{' '}
            <button
              onClick={() => onChange({ search: '', status: '', assigneeId: '' })}
              className="text-primary-500 font-semibold hover:underline cursor-pointer"
            >
              limpiar filtros
            </button>
          </>
        ) : (
          `${totalCount} tarea${totalCount !== 1 ? 's' : ''}`
        )}
      </div>
    </div>
  );
}
