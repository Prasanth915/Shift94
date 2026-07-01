import { useState, useCallback } from 'react';
import publishService from '@/services/publish.service';
import toast from 'react-hot-toast';

export function usePublish() {
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState({});
  const [error, setError] = useState(null);

  const publishToLinkedIn = useCallback(async (projectId) => {
    setPublishing(true);
    setError(null);
    setPublishStatus((prev) => ({ ...prev, linkedin: 'publishing' }));
    try {
      const data = await publishService.publishToLinkedIn(projectId);
      setPublishStatus((prev) => ({ ...prev, linkedin: 'success' }));
      toast.success('Published to LinkedIn!');
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to publish to LinkedIn';
      setPublishStatus((prev) => ({ ...prev, linkedin: 'error' }));
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setPublishing(false);
    }
  }, []);

  const publishToGitHub = useCallback(async (projectId) => {
    setPublishing(true);
    setError(null);
    setPublishStatus((prev) => ({ ...prev, github: 'publishing' }));
    try {
      const data = await publishService.publishToGitHub(projectId);
      setPublishStatus((prev) => ({ ...prev, github: 'success' }));
      toast.success('Published to GitHub!');
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to publish to GitHub';
      setPublishStatus((prev) => ({ ...prev, github: 'error' }));
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setPublishing(false);
    }
  }, []);

  const publishToAll = useCallback(async (projectId, platforms) => {
    setPublishing(true);
    setError(null);
    try {
      const data = await publishService.publishToAll(projectId, platforms);
      platforms.forEach((p) => {
        setPublishStatus((prev) => ({ ...prev, [p]: 'success' }));
      });
      toast.success('Published to all platforms!');
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to publish';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setPublishing(false);
    }
  }, []);

  const resetStatus = useCallback(() => {
    setPublishStatus({});
    setError(null);
  }, []);

  return {
    publishing,
    publishStatus,
    error,
    publishToLinkedIn,
    publishToGitHub,
    publishToAll,
    resetStatus,
  };
}
