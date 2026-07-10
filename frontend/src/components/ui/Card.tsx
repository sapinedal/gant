import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', padding = 'md', onClick }) => {
  const paddingClasses = { sm: 'p-4', md: 'p-6', lg: 'p-8', none: '' };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-md border border-neutral-200 hover:shadow-lg transition-shadow duration-200 ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 border-b border-neutral-100 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-bold text-neutral-800 ${className}`}>{children}</h3>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

export { Card };
export default Card;
