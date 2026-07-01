import React from 'react';

export const Skeleton = ({ className = '', variant = 'text' }) => {
  const baseStyle = 'animate-pulse bg-zinc-800 rounded';

  const variants = {
    text: 'h-4 w-full',
    circular: 'rounded-full h-10 w-10',
    rectangular: 'h-32 w-full',
  };

  return <div className={`${baseStyle} ${variants[variant]} ${className}`} />;
};

export default Skeleton;
