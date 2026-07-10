import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ChevronLeft, ChevronRight, Users, X } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [{ to: '/projects', label: 'Proyectos', icon: LayoutDashboard }];

export default function Sidebar({ isExpanded, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const { user } = useAuth();
  const items = user?.is_admin ? [...navItems, { to: '/admin/users', label: 'Usuarios', icon: Users }] : navItems;

  return (
    <>
      {isMobileOpen && <div className="fixed inset-0 z-30 bg-neutral-900/50 lg:hidden" onClick={onMobileClose} />}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-primary-500 text-white transition-all duration-300 logo-transition
          ${isExpanded ? 'w-64' : 'w-20'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <div className="flex items-center gap-2 overflow-hidden">
            <Logo size={28} variant="bare" className="shrink-0" />
            {isExpanded && <span className="font-bold text-lg whitespace-nowrap">Trazalo Gantt</span>}
          </div>
          <button onClick={onMobileClose} className="lg:hidden text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `sidebar-item-hover flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center h-12 border-t border-white/10 text-white/60 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </aside>
    </>
  );
}
