import api from './api.js';

/**
 * Service managing OAuth connections and repository discovery.
 */
export const oauthService = {
  /**
   * Initiates the OAuth flow by retrieving the authorization redirect URL.
   * @param {string} platform - GITHUB | LINKEDIN
   */
  getConnectUrl: (platform) => api.get(`/oauth/${platform.toLowerCase()}`),

  /**
   * Fetches the connection status of an OAuth platform.
   * @param {string} platform - GITHUB | LINKEDIN
   */
  getStatus: (platform) => api.get(`/oauth/${platform.toLowerCase()}/status`),

  /**
   * Disconnects an OAuth platform.
   * @param {string} platform - GITHUB | LINKEDIN
   */
  disconnect: (platform) => api.post(`/oauth/${platform.toLowerCase()}/disconnect`),

  /**
   * Fetches the user's GitHub repositories.
   */
  getRepositories: () => api.get('/oauth/github/repositories'),
};

export default oauthService;
