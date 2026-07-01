import { useState, useCallback } from 'react';
import projectService from '@/services/project.service';
import toast from 'react-hot-toast';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getAll(params);
      setProjects(data.projects || data || []);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch projects';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProject = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getById(id);
      setProject(data.project || data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch project';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.create(formData);
      toast.success('Project created successfully!');
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create project';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await projectService.update(id, data);
      toast.success('Project updated successfully!');
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update project';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await projectService.delete(id);
      setProjects((prev) => prev.filter((p) => (p._id || p.id) !== id));
      toast.success('Project deleted successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete project';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    projects,
    project,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
  };
}
