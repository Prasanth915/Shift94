import React from 'react';

export const Textarea = React.forwardRef(
  ({ label, error, className = '', rows = 4, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-medium text-zinc-400 block">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition duration-200 resize-none ${
            error ? 'border-red-900/50 focus:border-red-900/50 focus:ring-red-900/50' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-400 block mt-1">{error}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
