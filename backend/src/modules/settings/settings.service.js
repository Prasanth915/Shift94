import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../../../../shared/constants/index.js';

/**
 * Service orchestrating user settings, profile updates, and password security.
 * Enforces the Service Layer Pattern, utilizing Repositories via Dependency Injection.
 */
export class SettingsService {
  /**
   * @param {UserRepository} userRepository
   * @param {ConnectedAccountRepository} accountRepository
   */
  constructor(userRepository, accountRepository) {
    this.userRepository = userRepository;
    this.accountRepository = accountRepository;
  }

  /**
   * Updates user profile metadata.
   * @param {string} userId - User UUID
   * @param {object} data - Update payload (name, email)
   * @returns {Promise<object>} User DTO
   */
  async updateProfile(userId, data) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const updates = {};
    if (data.name) updates.name = data.name;

    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        const error = new Error('An account with this email already exists.');
        error.statusCode = 400;
        throw error;
      }
      updates.email = data.email;
    }

    const updatedUser = await this.userRepository.update(userId, updates);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      createdAt: updatedUser.createdAt,
    };
  }

  /**
   * Securely changes a user's password.
   * @param {string} userId - User UUID
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<void>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    // 1. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      const error = new Error('Invalid current password.');
      error.statusCode = 400;
      throw error;
    }

    // 2. Prevent reuse of the current password
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      const error = new Error('New password cannot be the same as your current password.');
      error.statusCode = 400;
      throw error;
    }

    // 3. Hash and update
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    await this.userRepository.update(userId, {
      password: hashedPassword,
    });
  }

  /**
   * Retrieves connected accounts, stripping credentials.
   * @param {string} userId - User UUID
   * @returns {Promise<object[]>}
   */
  async getConnectedAccounts(userId) {
    const accounts = await this.accountRepository.findByUserId(userId);
    return accounts.map((acc) => ({
      id: acc.id,
      platform: acc.platform,
      username: acc.username,
      profileUrl: acc.profileUrl,
      status: acc.status,
      createdAt: acc.createdAt,
    }));
  }

  /**
   * Disconnects a platform account.
   * @param {string} userId - User UUID
   * @param {string} platform - LINKEDIN | GITHUB
   * @returns {Promise<boolean>}
   */
  async disconnectAccount(userId, platform) {
    const connection = await this.accountRepository.findByUserIdAndPlatform(
      userId,
      platform.toUpperCase()
    );

    if (!connection) {
      const error = new Error(`No connected account found for platform: ${platform}`);
      error.statusCode = 404;
      throw error;
    }

    return this.accountRepository.delete(connection.id);
  }
}
