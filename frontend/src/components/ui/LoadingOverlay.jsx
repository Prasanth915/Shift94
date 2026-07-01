import React from 'react';
import { Spinner } from './Spinner.jsx';

export const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-zinc-950/60 backdrop-blur-[2px] rounded-2xl">
      <Spinner size="md" className="mb-2" />
      <span className="text-xs font-medium text-zinc-400">{message}</span>
    </div>
  );
};

export default LoadingOverlay;
