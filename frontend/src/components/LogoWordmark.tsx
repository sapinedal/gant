import Logo from './Logo';

interface LogoWordmarkProps {
  size?: number;
  className?: string;
  textClassName?: string;
  light?: boolean;
}

export default function LogoWordmark({ size = 32, className = '', textClassName = '', light = false }: LogoWordmarkProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo size={size} rounded={size * 0.25} />
      <span className={`font-bold leading-tight ${light ? 'text-white' : 'text-neutral-800'} ${textClassName}`}>
        Trazalo <span className="text-secondary-500">Gantt</span>
      </span>
    </div>
  );
}
