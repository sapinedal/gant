import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'save';
  size?: 'sm' | 'md' | 'lg' | 'xs';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  iconOnly = false,
  disabled = false,
  className = '',
  type = 'button',
  isLoading = false,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 shadow-sm';

  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-md',
    save: 'bg-secondary-500 text-white hover:bg-secondary-600 hover:shadow-md',
    secondary: 'bg-neutral-800 text-white hover:bg-neutral-700 hover:shadow-md',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
    ghost: 'text-neutral-700 hover:bg-neutral-100 shadow-none',
    danger: 'bg-error-500 text-white hover:bg-red-600 hover:shadow-md',
  };

  const sizeClasses = {
    sm: iconOnly ? 'p-1.5 text-sm' : 'px-3 py-1.5 text-sm',
    md: iconOnly ? 'p-2 text-sm' : 'px-4 py-2 text-sm',
    lg: iconOnly ? 'p-3 text-base' : 'px-6 py-3 text-base',
    xs: iconOnly ? 'p-1.5 text-xs' : 'px-2 py-1 text-xs',
  };

  const isBtnDisabled = disabled || isLoading;
  const disabledClasses = isBtnDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      disabled={isBtnDisabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        Icon && iconPosition === 'left' && <Icon className={`w-4 h-4 ${iconOnly ? '' : 'mr-2'}`} />
      )}
      {children}
      {!isLoading && Icon && iconPosition === 'right' && <Icon className={`w-4 h-4 ${iconOnly ? '' : 'ml-2'}`} />}
    </button>
  );
};

export default Button;
