import React from 'react';

export const PageHeader = ({ title, description, actions, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800/50 mb-6 ${className}`}>
      <div>
        <h1 className="text-xl font-semibold text-zinc-50 font-display">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-zinc-400 mt-1">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
