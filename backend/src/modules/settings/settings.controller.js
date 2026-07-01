import { formatStandardResponse } from '../../../../shared/helpers/index.js';

/**
 * Controller handling HTTP request/response parsing for User Settings endpoints.
 * Enforces the Controller Layer, utilizing SettingsService via Dependency Injection.
 */
export class SettingsController {
  /**
   * @param {SettingsService} settingsService
   */
  constructor(settingsService) {
    this.settingsService = settingsService;
  }

  /**
   * Handles retrieving the user's profile details.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  getProfile = async (req, res, next) => {
    try {
      const user = await this.settingsService.userRepository.findById(req.user.id);
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }

      // Map to clean DTO
      const profile = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      };

      res.status(200).json(
        formatStandardResponse(true, 'Profile retrieved successfully.', { user: profile })
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Handles updating the user's profile metadata.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  updateProfile = async (req, res, next) => {
    try {
      const { name, email } = req.body;
      const user = await this.settingsService.updateProfile(req.user.id, { name, email });

      res.status(200).json(
        formatStandardResponse(true, 'Profile updated successfully.', { user })
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Handles changing the user's password.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  changePassword = async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await this.settingsService.changePassword(req.user.id, currentPassword, newPassword);

      res.status(200).json(
        formatStandardResponse(true, 'Password changed successfully.')
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Handles listing connected OAuth accounts.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  getAccounts = async (req, res, next) => {
    try {
      const accounts = await this.settingsService.getConnectedAccounts(req.user.id);

      res.status(200).json(
        formatStandardResponse(true, 'Connected accounts retrieved.', { accounts })
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Handles disconnecting a GitHub account.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  disconnectGitHub = async (req, res, next) => {
    try {
      await this.settingsService.disconnectAccount(req.user.id, 'GITHUB');

      res.status(200).json(
        formatStandardResponse(true, 'GitHub account disconnected successfully.')
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Handles disconnecting a LinkedIn account.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  disconnectLinkedIn = async (req, res, next) => {
    try {
      await this.settingsService.disconnectAccount(req.user.id, 'LINKEDIN');

      res.status(200).json(
        formatStandardResponse(true, 'LinkedIn account disconnected successfully.')
      );
    } catch (err) {
      next(err);
    }
  };
}
