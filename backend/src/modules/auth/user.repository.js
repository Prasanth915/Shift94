import prisma from '../../../config/db.js';

/**
 * Repository handling all database operations for the User model.
 * Enforces the Repository Pattern, isolating Prisma queries from business services.
 */
export class UserRepository {
  /**
   * Finds a user by their unique UUID.
   * @param {string} id - User UUID
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Finds a user by their unique email address.
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Creates a new user record.
   * @param {object} data
   * @param {string} data.name
   * @param {string} data.email
   * @param {string} data.password - Already hashed
   * @returns {Promise<object>}
   */
  async create(data) {
    return prisma.user.create({
      data,
    });
  }

  /**
   * Updates an existing user record.
   * @param {string} id - User UUID
   * @param {object} data
   * @returns {Promise<object>}
   */
  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes a user record.
   * @param {string} id - User UUID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const deleted = await prisma.user.delete({
      where: { id },
    });
    return !!deleted;
  }
}
