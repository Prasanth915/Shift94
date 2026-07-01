import api from './api.js';

/**
 * Service managing publishing history logs and retry requests.
 */
export const historyService = {
  /**
   * Retrieves a paginated list of publish logs.
   * @param {object} params - Query parameters (page, limit, platform, status)
   */
  getHistory: (params) => api.get('/history', { params }),

  /**
   * Retrieves a publish log's details by ID.
   * @param {string} id
   */
  getLogById: (id) => api.get(`/history/${id}`),

  /**
   * Retries a failed publishing attempt.
   * @param {string} id - Publish log URN/UUID
   */
  retry: (id) => api.post(`/history/${id}/retry`),
};

export default historyService;
