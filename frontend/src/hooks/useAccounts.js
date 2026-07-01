import { useState, useCallback } from 'react';
import oauthService from '@/services/oauth.service';
import toast from 'react-hot-toast';

export function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await oauthService.getConnectedAccounts();
      setAccounts(data.accounts || data || []);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch accounts';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const connectLinkedIn = useCallback(async () => {
    setConnecting('linkedin');
    try {
      const data = await oauthService.getLinkedInAuthUrl();
      window.location.href = data.url || data.authUrl;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to connect LinkedIn';
      toast.error(msg);
      setConnecting(null);
    }
  }, []);

  const connectGitHub = useCallback(async () => {
    setConnecting('github');
    try {
      const data = await oauthService.getGitHubAuthUrl();
      window.location.href = data.url || data.authUrl;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to connect GitHub';
      toast.error(msg);
      setConnecting(null);
    }
  }, []);

  const disconnectAccount = useCallback(async (platform) => {
    try {
      await oauthService.disconnectAccount(platform);
      setAccounts((prev) => prev.filter((a) => a.platform !== platform));
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to disconnect account';
      toast.error(msg);
      throw err;
    }
  }, []);

  const isConnected = useCallback(
    (platform) => accounts.some((a) => a.platform === platform),
    [accounts]
  );

  return {
    accounts,
    loading,
    connecting,
    fetchAccounts,
    connectLinkedIn,
    connectGitHub,
    disconnectAccount,
    isConnected,
  };
}
