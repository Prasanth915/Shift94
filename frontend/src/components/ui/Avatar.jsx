import React from 'react';

export const Avatar = ({ name = '', src = '', size = 'md', className = '' }) => {
  const getInitials = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 font-medium text-zinc-200 select-none ${sizes[size]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ) : null}
      <span className={src ? 'hidden' : ''}>{getInitials(name)}</span>
    </div>
  );
};

export default Avatar;
