const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Create a new project for a user.
 * @param {string} userId
 * @param {object} data — project fields
 * @returns {Promise<object>}
 */
async function createProject(userId, data) {
  return prisma.project.create({
    data: {
      userId,
      title: data.title,
      subtitle: data.subtitle || null,
      description: data.description || null,
      image: data.image || null,
      githubUrl: data.githubUrl || null,
      demoUrl: data.demoUrl || null,
      techStack: data.techStack || [],
      tags: data.tags || [],
      status: data.status || 'DRAFT',
    },
    include: { publishLogs: true },
  });
}

/**
 * Get all projects for a user with optional pagination, search, and status filter.
 * @param {string} userId
 * @param {{ page?: number, limit?: number, search?: string, status?: string }} options
 * @returns {Promise<{ projects: object[], total: number }>}
 */
async function getProjects(userId, { page = 1, limit = 10, search, status } = {}) {
  const where = { userId };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { publishLogs: true },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);

  return { projects, total };
}

/**
 * Get a single project by ID, scoped to the owning user.
 * @param {string} projectId
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
async function getProjectById(projectId, userId) {
  return prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { publishLogs: true },
  });
}

/**
 * Update a project (only if owned by the user).
 * @param {string} projectId
 * @param {string} userId
 * @param {object} data — fields to update
 * @returns {Promise<object|null>}
 */
async function updateProject(projectId, userId, data) {
  // Verify ownership first
  const existing = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!existing) return null;

  return prisma.project.update({
    where: { id: projectId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.githubUrl !== undefined && { githubUrl: data.githubUrl }),
      ...(data.demoUrl !== undefined && { demoUrl: data.demoUrl }),
      ...(data.techStack !== undefined && { techStack: data.techStack }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.status !== undefined && { status: data.status }),
    },
    include: { publishLogs: true },
  });
}

/**
 * Delete a project (only if owned by the user).
 * @param {string} projectId
 * @param {string} userId
 * @returns {Promise<boolean>} true if deleted, false if not found / not owned
 */
async function deleteProject(projectId, userId) {
  const existing = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!existing) return false;

  await prisma.project.delete({ where: { id: projectId } });
  return true;
}

/**
 * Create a publish log entry for a project.
 * @param {object} data
 * @returns {Promise<object>}
 */
async function createPublishLog(data) {
  return prisma.publishLog.create({ data });
}

/**
 * Update a publish log entry.
 * @param {string} logId
 * @param {object} data
 * @returns {Promise<object>}
 */
async function updatePublishLog(logId, data) {
  return prisma.publishLog.update({ where: { id: logId }, data });
}

/**
 * Get publish history for a user (all projects).
 * @param {string} userId
 * @param {{ page?: number, limit?: number }} options
 * @returns {Promise<{ logs: object[], total: number }>}
 */
async function getPublishHistory(userId, { page = 1, limit = 20 } = {}) {
  const where = { project: { userId } };

  const [logs, total] = await Promise.all([
    prisma.publishLog.findMany({
      where,
      include: {
        project: {
          select: { id: true, title: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.publishLog.count({ where }),
  ]);

  return { logs, total };
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  createPublishLog,
  updatePublishLog,
  getPublishHistory,
};
