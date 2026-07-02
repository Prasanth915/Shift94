import prisma from '../../../config/db.js';

/**
 * Repository handling all database operations for the PublishLog model.
 * Enforces the Repository Pattern, isolating Prisma queries from business services.
 */
export class PublishLogRepository {
  /**
   * Creates a new publish log.
   * @param {object} data
   * @returns {Promise<object>}
   */
  async create(data) {
    return prisma.publishLog.create({
      data,
    });
  }

  /**
   * Updates the status and details of a publish log.
   * @param {string} id - PublishLog UUID
   * @param {string} status - PENDING | PUBLISHING | PUBLISHED | FAILED
   * @param {string|null} externalUrl - Link to the published post
   * @param {object|null} apiResponse - Raw response from the platform API
   * @returns {Promise<object>}
   */
  async updateStatus(id, status, externalUrl = null, apiResponse = null) {
    return prisma.publishLog.update({
      where: { id },
      data: {
        status,
        externalUrl,
        apiResponse,
      },
    });
  }

  /**
   * Finds a publish log by its unique UUID.
   * @param {string} id - PublishLog UUID
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    return prisma.publishLog.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });
  }

  /**
   * Finds all publish logs for a specific project.
   * @param {string} projectId - Project UUID
   * @returns {Promise<object[]>}
   */
  async findByProjectId(projectId) {
    return prisma.publishLog.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Finds all publish logs for a specific user's projects.
   * @param {string} userId - User UUID
   * @returns {Promise<object[]>}
   */
  async findByUserId(userId) {
    return prisma.publishLog.findMany({
      where: {
        project: {
          userId,
        },
      },
      include: {
        project: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Finds all publish logs with pagination.
   * @param {object} filter
   * @param {string} [filter.userId]
   * @param {string} [filter.status]
   * @param {string} [filter.platform]
   * @param {number} [filter.skip]
   * @param {number} [filter.take]
   * @returns {Promise<object[]>}
   */
  async findAll(filter = {}) {
    const where = {};

    if (filter.userId) {
      where.project = {
        userId: filter.userId,
      };
    }
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.platform) {
      where.platform = filter.platform;
    }

    return prisma.publishLog.findMany({
      where,
      skip: filter.skip,
      take: filter.take,
      include: {
        project: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Resets a failed publish log back to PENDING.
   * @param {string} id - PublishLog UUID
   * @returns {Promise<object>}
   */
  async retryFailed(id) {
    return prisma.publishLog.update({
      where: { id },
      data: {
        status: 'PENDING',
        externalUrl: null,
        apiResponse: null,
      },
    });
  }

  /**
   * Finds an active publish log (PENDING or PUBLISHING) for a specific project and platform.
   * @param {string} projectId
   * @param {string} platform
   * @returns {Promise<object|null>}
   */
  async findActiveLog(projectId, platform) {
    return prisma.publishLog.findFirst({
      where: {
        projectId,
        platform: platform.toUpperCase(),
        status: { in: ['PENDING', 'PUBLISHING'] },
      },
    });
  }

  /**
   * Atomically updates status from PENDING to PUBLISHING to acquire a thread lock.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async acquirePublishLock(id) {
    return prisma.publishLog.update({
      where: { id, status: 'PENDING' },
      data: { status: 'PUBLISHING' },
    });
  }

  /**
   * Counts the total number of publish logs matching filters.
   * @param {object} filter
   * @param {string} [filter.userId]
   * @param {string} [filter.status]
   * @param {string} [filter.platform]
   * @returns {Promise<number>}
   */
  async count(filter = {}) {
    const where = {};

    if (filter.userId) {
      where.project = {
        userId: filter.userId,
      };
    }
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.platform) {
      where.platform = filter.platform;
    }

    return prisma.publishLog.count({ where });
  }
}
