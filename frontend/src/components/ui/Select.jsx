import React from 'react';

export const Select = React.forwardRef(
  ({ label, error, options = [], className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-medium text-zinc-400 block">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-50 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition duration-200 cursor-pointer ${
            error ? 'border-red-900/50 focus:border-red-900/50 focus:ring-red-900/50' : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-950">
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-xs text-red-400 block mt-1">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
