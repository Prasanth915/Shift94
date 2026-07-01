import api from './api.js';

/**
 * Service managing project showcases.
 * Communicates with /api/v1/projects.
 */
export const projectService = {
  /**
   * Retrieves a paginated, filtered list of projects.
   * @param {object} params - Query parameters (page, limit, search, status)
   */
  getAll: (params) => api.get('/projects', { params }),

  /**
   * Retrieves a project by ID.
   * @param {string} id
   */
  getById: (id) => api.get(`/projects/${id}`),

  /**
   * Creates a new project showcase. Supports multipart/form-data.
   * @param {FormData} formData
   */
  create: (formData) =>
    api.post('/projects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  /**
   * Updates an existing project showcase.
   * @param {string} id
   * @param {FormData} formData
   */
  update: (id, formData) =>
    api.put(`/projects/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  /**
   * Deletes a project showcase.
   * @param {string} id
   */
  delete: (id) => api.delete(`/projects/${id}`),
};

export default projectService;
