import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Layout wrapper for guest-only authentication pages (Login, Register).
 * Renders a centered glassmorphic card against a premium dark background.
 */
export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4">
      {/* Premium ambient glow background */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-zinc-900/40 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-zinc-900/30 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6 animate-slide-up">
        {/* Branding Logo */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-bold tracking-tight text-white font-display">
              SHIFT <span className="text-zinc-500">9</span>
            </span>
          </Link>
          {title && (
            <h2 className="text-lg font-semibold text-zinc-50 mt-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Panel */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-8 backdrop-blur-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
