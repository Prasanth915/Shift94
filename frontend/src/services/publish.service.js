import api from './api.js';

/**
 * Service triggering project publishing to selected platforms.
 */
export const publishService = {
  /**
   * Publishes a project to a list of target platforms.
   * @param {string} projectId
   * @param {string[]} platforms - e.g. ['LINKEDIN', 'GITHUB']
   */
  publish: (projectId, platforms) => api.post('/publish', { projectId, platforms }),
};

export default publishService;
