import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Spinner } from '../components/ui/Spinner.jsx';

/**
 * Endpoint receiver handling redirect parameters from OAuth platforms.
 */
export const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const message = searchParams.get('message');

    if (status === 'success') {
      toast.success(`Successfully connected ${platform}!`);
      navigate('/settings');
    } else {
      toast.error(`Connection failed: ${message || 'Unknown error'}`);
      navigate('/settings');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4 text-zinc-400">
      <Spinner size="lg" />
      <span className="text-xs font-medium">Verifying authorization credentials...</span>
    </div>
  );
};

export default OAuthCallback;
