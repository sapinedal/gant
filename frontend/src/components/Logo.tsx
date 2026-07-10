interface LogoProps {
  size?: number;
  rounded?: number;
  className?: string;
  /** 'boxed' = fondo azul primario (para superficies claras). 'bare' = solo las barras, sin fondo (para superficies oscuras como el sidebar). */
  variant?: 'boxed' | 'bare';
}

/**
 * Marca de Trazalo Gantt: barras en cascada evocando un cronograma Gantt.
 */
export default function Logo({ size = 40, rounded = 10, className = '', variant = 'boxed' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Trazalo Gantt"
    >
      {variant === 'boxed' && <rect width="40" height="40" rx={rounded} fill="#223A7C" />}
      <rect x="7" y="12" width="15" height="4.5" rx="2.25" fill={variant === 'boxed' ? '#FFFFFF' : '#577BDE'} />
      <rect x="13" y="18.75" width="17" height="4.5" rx="2.25" fill="#1AD5C3" />
      <rect x="10" y="25.5" width="12" height="4.5" rx="2.25" fill="#00A99D" />
    </svg>
  );
}
