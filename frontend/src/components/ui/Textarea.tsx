import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className = '', id, ...props }, ref) => {
  const areaId = id ?? props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={areaId} className="block text-sm font-semibold text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={areaId}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400/40 ${
          error ? 'border-error-500' : 'border-neutral-300 focus:border-primary-400'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
