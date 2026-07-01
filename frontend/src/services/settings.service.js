import api from './api.js';

/**
 * Service managing user settings and password changes.
 */
export const settingsService = {
  /**
   * Retrieves the authenticated user's profile details.
   */
  getProfile: () => api.get('/settings/profile'),

  /**
   * Updates the user's profile details.
   * @param {object} data - { name, email }
   */
  updateProfile: (data) => api.put('/settings/profile', data),

  /**
   * Modifies the user's password.
   * @param {object} data - { currentPassword, newPassword, confirmPassword }
   */
  changePassword: (data) => api.patch('/settings/password', data),

  /**
   * Lists connected accounts.
   */
  getAccounts: () => api.get('/settings/accounts'),
};

export default settingsService;
