import prisma from '../../../config/db.js';

/**
 * Repository handling all database operations for the Project model.
 * Enforces the Repository Pattern, isolating Prisma queries from business services.
 */
export class ProjectRepository {
  /**
   * Creates a new project.
   * @param {object} data
   * @returns {Promise<object>}
   */
  async create(data) {
    return prisma.project.create({
      data,
    });
  }

  /**
   * Updates an existing project.
   * @param {string} id - Project UUID
   * @param {object} data
   * @returns {Promise<object>}
   */
  async update(id, data) {
    return prisma.project.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes a project.
   * @param {string} id - Project UUID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const deleted = await prisma.project.delete({
      where: { id },
    });
    return !!deleted;
  }

  /**
   * Finds a project by its unique UUID.
   * @param {string} id - Project UUID
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        publishLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Finds all projects matching filters with pagination.
   * @param {object} filter
   * @param {string} [filter.userId]
   * @param {string} [filter.status]
   * @param {string} [filter.search]
   * @param {number} [filter.skip]
   * @param {number} [filter.take]
   * @returns {Promise<object[]>}
   */
  async findAll(filter = {}) {
    const where = {};

    if (filter.userId) {
      where.userId = filter.userId;
    }
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { subtitle: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return prisma.project.findMany({
      where,
      skip: filter.skip,
      take: filter.take,
      orderBy: { createdAt: 'desc' },
      include: {
        publishLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Finds all projects for a specific user.
   * @param {string} userId - User UUID
   * @returns {Promise<object[]>}
   */
  async findByUserId(userId) {
    return prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Searches projects by title, subtitle, or description for a specific user.
   * @param {string} query
   * @param {string} userId - User UUID
   * @returns {Promise<object[]>}
   */
  async search(query, userId) {
    return prisma.project.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { subtitle: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Counts the total number of projects matching filters.
   * @param {object} filter
   * @param {string} [filter.userId]
   * @param {string} [filter.status]
   * @returns {Promise<number>}
   */
  async count(filter = {}) {
    const where = {};

    if (filter.userId) {
      where.userId = filter.userId;
    }
    if (filter.status) {
      where.status = filter.status;
    }

    return prisma.project.count({ where });
  }
}
