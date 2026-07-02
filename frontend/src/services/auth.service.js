import api from './api.js';

/**
 * Service handling all authentication HTTP requests.
 */
export const authService = {
  /**
   * Log in a user.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} Auth payload containing user and token
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.success && response.data.token) {
      sessionStorage.setItem('shift94_token', response.data.token);
    }
    return response.data;
  },

  /**
   * Register a new user.
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} Auth payload containing user and token
   */
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.success && response.data.token) {
      sessionStorage.setItem('shift94_token', response.data.token);
    }
    return response.data;
  },

  /**
   * Fetch the currently authenticated user's profile.
   * @returns {Promise<object>} User profile details
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  /**
   * Log out the user by clearing credentials.
   */
  logout: () => {
    sessionStorage.removeItem('shift94_token');
    sessionStorage.removeItem('shift9_token');
  },
};

export default authService;
