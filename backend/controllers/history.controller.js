const projectService = require('../services/project.service');
const { success, paginated } = require('../utils/apiResponse');

/**
 * GET /api/history
 * Get publish history for the authenticated user across all projects.
 */
async function getHistory(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const { logs, total } = await projectService.getPublishHistory(req.user.userId, {
      page,
      limit,
    });

    return paginated(res, logs, total, page, limit, 'Publish history retrieved');
  } catch (err) {
    next(err);
  }
}

module.exports = { getHistory };
