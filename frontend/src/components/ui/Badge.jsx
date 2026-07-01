import React from 'react';

export const Badge = ({ children, className = '', variant = 'info', size = 'md' }) => {
  const baseStyle = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    success: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50',
    warning: 'bg-amber-950/40 text-amber-400 border border-amber-900/50',
    error: 'bg-red-950/40 text-red-400 border border-red-900/50',
    info: 'bg-zinc-800/60 text-zinc-300 border border-zinc-700/60',
    pending: 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/50',
    publishing: 'bg-cyan-950/40 text-cyan-400 border border-cyan-900/50 animate-pulse',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
