import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
}

const variantClasses = {
  primary: 'bg-primary-50 text-primary-600',
  secondary: 'bg-secondary-50 text-secondary-700',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  error: 'bg-red-50 text-error-500',
  neutral: 'bg-neutral-100 text-neutral-600',
};

const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}>
    {children}
  </span>
);

export default Badge;
