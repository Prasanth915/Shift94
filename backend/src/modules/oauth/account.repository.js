import prisma from '../../../config/db.js';

/**
 * Repository handling all database operations for the ConnectedAccount model.
 * Enforces the Repository Pattern, isolating Prisma queries from business services.
 */
export class ConnectedAccountRepository {
  /**
   * Creates a new connected account.
   * @param {object} data
   * @returns {Promise<object>}
   */
  async create(data) {
    return prisma.connectedAccount.create({
      data,
    });
  }

  /**
   * Updates an existing connected account.
   * @param {string} id - ConnectedAccount UUID
   * @param {object} data
   * @returns {Promise<object>}
   */
  async update(id, data) {
    return prisma.connectedAccount.update({
      where: { id },
      data,
    });
  }

  /**
   * Finds all connected accounts for a specific user.
   * @param {string} userId - User UUID
   * @returns {Promise<object[]>}
   */
  async findByUserId(userId) {
    return prisma.connectedAccount.findMany({
      where: { userId },
      orderBy: { platform: 'asc' },
    });
  }

  /**
   * Finds a connected account by user ID and platform.
   * @param {string} userId - User UUID
   * @param {string} platform - LINKEDIN | GITHUB | INSTAGRAM | PORTFOLIO
   * @returns {Promise<object|null>}
   */
  async findByUserIdAndPlatform(userId, platform) {
    return prisma.connectedAccount.findUnique({
      where: {
        userId_platform: {
          userId,
          platform,
        },
      },
    });
  }

  /**
   * Updates the OAuth tokens for a connected account.
   * @param {string} id - ConnectedAccount UUID
   * @param {string} accessToken - Encrypted access token
   * @param {string|null} refreshToken - Encrypted refresh token
   * @returns {Promise<object>}
   */
  async updateTokens(id, accessToken, refreshToken = null) {
    return prisma.connectedAccount.update({
      where: { id },
      data: {
        accessToken,
        refreshToken,
        status: 'CONNECTED',
      },
    });
  }

  /**
   * Deletes a connected account.
   * @param {string} id - ConnectedAccount UUID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const deleted = await prisma.connectedAccount.delete({
      where: { id },
    });
    return !!deleted;
  }

  /**
   * Checks if a connected account exists for a user and platform.
   * @param {string} userId - User UUID
   * @param {string} platform - LINKEDIN | GITHUB | INSTAGRAM | PORTFOLIO
   * @returns {Promise<boolean>}
   */
  async exists(userId, platform) {
    const count = await prisma.connectedAccount.count({
      where: {
        userId,
        platform,
      },
    });
    return count > 0;
  }
}
