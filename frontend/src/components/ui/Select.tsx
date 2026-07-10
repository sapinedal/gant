import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ label, options, error, className = '', id, ...props }, ref) => {
  const selectId = id ?? props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-neutral-800 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400/40 ${
          error ? 'border-error-500' : 'border-neutral-300 focus:border-primary-400'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
