const projectService = require('../services/project.service');
const { success, error, paginated } = require('../utils/apiResponse');

/**
 * POST /api/project
 * Create a new project.
 */
async function create(req, res, next) {
  try {
    const data = { ...req.body };

    // If an image file was uploaded, use its path
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }

    const project = await projectService.createProject(req.user.userId, data);
    return success(res, { project }, 'Project created', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/project
 * List all projects for the authenticated user.
 */
async function getAll(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const { search, status } = req.query;

    const { projects, total } = await projectService.getProjects(req.user.userId, {
      page,
      limit,
      search,
      status,
    });

    return paginated(res, projects, total, page, limit, 'Projects retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/project/:id
 * Get a single project by ID.
 */
async function getById(req, res, next) {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user.userId);
    if (!project) {
      return error(res, 'Project not found', 404);
    }
    return success(res, { project });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/project/:id
 * Update an existing project.
 */
async function update(req, res, next) {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }

    const project = await projectService.updateProject(req.params.id, req.user.userId, data);
    if (!project) {
      return error(res, 'Project not found or access denied', 404);
    }
    return success(res, { project }, 'Project updated');
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/project/:id
 * Delete a project.
 */
async function remove(req, res, next) {
  try {
    const deleted = await projectService.deleteProject(req.params.id, req.user.userId);
    if (!deleted) {
      return error(res, 'Project not found or access denied', 404);
    }
    return success(res, null, 'Project deleted');
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getAll, getById, update, remove };
