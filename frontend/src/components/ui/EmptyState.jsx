import React from 'react';
import { Button } from './Button.jsx';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20 ${className}`}
    >
      {Icon && (
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl mb-4">
          <Icon className="h-6 w-6 text-zinc-400" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-zinc-50 font-display mb-1">{title}</h3>
      <p className="text-xs text-zinc-400 max-w-xs mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
