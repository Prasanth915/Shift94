import React from 'react';

export const Button = React.forwardRef(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyle =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 duration-200 cursor-pointer';

    const variants = {
      primary: 'bg-zinc-50 text-zinc-950 hover:bg-zinc-200',
      secondary: 'bg-zinc-900 text-zinc-50 border border-zinc-800 hover:bg-zinc-800',
      outline: 'border border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white',
      ghost: 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50',
      danger: 'bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/30',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <span className="mr-2 animate-spin rounded-full border-2 border-t-transparent border-current h-4 w-4" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
