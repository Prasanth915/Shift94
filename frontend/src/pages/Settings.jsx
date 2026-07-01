import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Github, Linkedin, ShieldAlert, Instagram, Globe } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import settingsService from '../services/settings.service.js';
import oauthService from '../services/oauth.service.js';

export const Settings = () => {
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(true);

  // Connection states
  const [githubAccount, setGithubAccount] = useState(null);
  const [linkedinAccount, setLinkedinAccount] = useState(null);

  // Forms
  const {
    register: profileReg,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm();

  const {
    register: passwordReg,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm();

  // Load initial settings
  const loadSettings = async () => {
    try {
      const [profileRes, accountsRes] = await Promise.all([
        settingsService.getProfile(),
        settingsService.getAccounts(),
      ]);

      const user = profileRes.data.user;
      setProfileValue('name', user.name);
      setProfileValue('email', user.email);

      const accounts = accountsRes.data.accounts;
      setGithubAccount(accounts.find((a) => a.platform === 'GITHUB') || null);
      setLinkedinAccount(accounts.find((a) => a.platform === 'LINKEDIN') || null);
    } catch {
      toast.error('Failed to load profile or connected accounts.');
    } finally {
      setAccountsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [setProfileValue]);

  // Submit profile updates
  const onProfileUpdate = async (data) => {
    setProfileLoading(true);
    try {
      await settingsService.updateProfile(data);
      toast.success('Profile details updated successfully!');
      loadSettings();
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Submit password change
  const onPasswordChange = async (data) => {
    setPasswordLoading(true);
    try {
      await settingsService.changePassword(data);
      toast.success('Password changed successfully!');
      resetPasswordForm();
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Connect Platform (initiates OAuth)
  const connectPlatform = async (platform) => {
    try {
      const response = await oauthService.getConnectUrl(platform);
      window.location.href = response.data.url;
    } catch {
      toast.error(`Failed to initiate ${platform} connection.`);
    }
  };

  // Disconnect Platform
  const disconnectPlatform = async (platform) => {
    toast.loading(`Disconnecting ${platform}...`, { id: 'disconnect-toast' });
    try {
      await oauthService.disconnect(platform);
      toast.success(`${platform} disconnected successfully.`, { id: 'disconnect-toast' });
      loadSettings();
    } catch (err) {
      toast.error(err.message || `Failed to disconnect ${platform}.`, { id: 'disconnect-toast' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50 font-display">Account Settings</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your personal profile, credentials, and platform connections.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile & Password (Col span 2) */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Profile Details</CardTitle>
                <CardDescription className="text-[10px]">Update your display name and contact email.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4">
                  <Input
                    label="Full Name"
                    error={profileErrors.name?.message}
                    {...profileReg('name', { required: 'Name is required' })}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    error={profileErrors.email?.message}
                    {...profileReg('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                    })}
                  />
                  <Button type="submit" variant="secondary" size="sm" loading={profileLoading}>
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Security & Password</CardTitle>
                <CardDescription className="text-[10px]">Modify your account password below.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="••••••••"
                    error={passwordErrors.currentPassword?.message}
                    {...passwordReg('currentPassword', { required: 'Current password is required' })}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    error={passwordErrors.newPassword?.message}
                    {...passwordReg('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    })}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="••••••••"
                    error={passwordErrors.confirmPassword?.message}
                    {...passwordReg('confirmPassword', { required: 'Please confirm your new password' })}
                  />
                  <Button type="submit" variant="secondary" size="sm" loading={passwordLoading}>
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Connected Accounts */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Connected Accounts</CardTitle>
                <CardDescription className="text-[10px]">Link your developer social profiles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {accountsLoading ? (
                  <div className="py-4 flex justify-center">
                    <Spinner size="sm" />
                  </div>
                ) : (
                  <>
                    {/* GitHub Connection */}
                    <div className="flex items-center justify-between p-3 border border-zinc-850 rounded-xl bg-zinc-950/20">
                      <div className="flex items-center gap-2">
                        <Github className="h-4 w-4 text-zinc-400" />
                        <div>
                          <p className="text-xs font-semibold text-zinc-200">GitHub</p>
                          {githubAccount ? (
                            <p className="text-[10px] text-zinc-500 truncate max-w-[120px]">{githubAccount.username}</p>
                          ) : (
                            <p className="text-[10px] text-zinc-500">Not linked</p>
                          )}
                        </div>
                      </div>
                      {githubAccount ? (
                        <Button variant="danger" size="sm" className="h-7 text-xs px-2.5" onClick={() => disconnectPlatform('GITHUB')}>
                          Disconnect
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" onClick={() => connectPlatform('GITHUB')}>
                          Connect
                        </Button>
                      )}
                    </div>

                    {/* LinkedIn Connection */}
                    <div className="flex items-center justify-between p-3 border border-zinc-850 rounded-xl bg-zinc-950/20">
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-zinc-400" />
                        <div>
                          <p className="text-xs font-semibold text-zinc-200">LinkedIn</p>
                          {linkedinAccount ? (
                            <p className="text-[10px] text-zinc-500 truncate max-w-[120px]">{linkedinAccount.username}</p>
                          ) : (
                            <p className="text-[10px] text-zinc-500">Not linked</p>
                          )}
                        </div>
                      </div>
                      {linkedinAccount ? (
                        <Button variant="danger" size="sm" className="h-7 text-xs px-2.5" onClick={() => disconnectPlatform('LINKEDIN')}>
                          Disconnect
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" onClick={() => connectPlatform('LINKEDIN')}>
                          Connect
                        </Button>
                      )}
                    </div>

                    {/* Instagram - Coming Soon */}
                    <div className="flex items-center justify-between p-3 border border-zinc-900 rounded-xl opacity-40">
                      <div className="flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-zinc-600" />
                        <div>
                          <p className="text-xs font-semibold text-zinc-400">Instagram</p>
                          <p className="text-[10px] text-zinc-600">Coming Soon</p>
                        </div>
                      </div>
                      <Badge variant="info" size="sm">Soon</Badge>
                    </div>

                    {/* Portfolio Website - Coming Soon */}
                    <div className="flex items-center justify-between p-3 border border-zinc-900 rounded-xl opacity-40">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-zinc-600" />
                        <div>
                          <p className="text-xs font-semibold text-zinc-400">Portfolio Web</p>
                          <p className="text-[10px] text-zinc-600">Coming Soon</p>
                        </div>
                      </div>
                      <Badge variant="info" size="sm">Soon</Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
