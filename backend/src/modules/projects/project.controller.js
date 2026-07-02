import { formatStandardResponse } from '../../../../shared/helpers/index.js';

/**
 * Controller handling HTTP request/response parsing for Project Management endpoints.
 * Enforces the Controller Layer, utilizing ProjectService via Dependency Injection.
 */
export class ProjectController {
  /**
   * @param {ProjectService} projectService
   */
  constructor(projectService) {
    this.projectService = projectService;
  }

  /**
   * Helper to parse array fields (techStack, tags, platforms) from multipart form data.
   * @param {any} value
   * @returns {string[]}
   */
  parseArrayField(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map((item) => item.trim()).filter(Boolean);
      }
    }
    return [];
  }

  /**
   * Handles project creation.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  create = async (req, res, next) => {
    try {
      const { title, subtitle, description, githubUrl, demoUrl } = req.body;
      const techStack = this.parseArrayField(req.body.techStack);
      const tags = this.parseArrayField(req.body.tags);

      // Extract local file path if uploaded
      const image = req.file ? `/uploads/${req.file.filename}` : null;

      let sourceRepository = null;
      if (req.body.sourceRepository) {
        try {
          sourceRepository = typeof req.body.sourceRepository === 'string'
            ? JSON.parse(req.body.sourceRepository)
            : req.body.sourceRepository;
        } catch (parseErr) {
          console.warn('Failed to parse sourceRepository:', parseErr.message);
        }
      }

      const project = await this.projectService.createProject(req.user.id, {
        title,
        subtitle,
        description,
        githubUrl,
        demoUrl,
        techStack,
        tags,
        image,
        status: 'DRAFT',
        sourceRepository,
      });

      res.status(201).json(
        formatStandardResponse(true, 'Project created successfully.', { project })
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Handles updating a project.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, subtitle, description, githubUrl, demoUrl, status } = req.body;
      
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (subtitle !== undefined) updates.subtitle = subtitle || null;
      if (description !== undefined) updates.description = description;
      if (githubUrl !== undefined) updates.githubUrl = githubUrl || null;
      if (demoUrl !== undefined) updates.demoUrl = demoUrl || null;
      if (status !== undefined) updates.status = status;

      if (req.body.techStack !== undefined) {
        updates.techStack = this.parseArrayField(req.body.techStack);
      }
      if (req.body.tags !== undefined) {
        updates.tags = this.parseArrayField(req.body.tags);
      }

      if (req.file) {
        updates.image = `/uploads/${req.file.filename}`;
      }

      if (req.body.sourceRepository !== undefined) {
        try {
          updates.sourceRepository = typeof req.body.sourceRepository === 'string'
            ? JSON.parse(req.body.sourceRepository)
            : req.body.sourceRepository;
        } catch (parseErr) {
          console.warn('Failed to parse sourceRepository:', parseErr.message);
        }
      }

      const project = await this.projectService.updateProject(id, req.user.id, updates);

      res.status(200).json(
        formatStandardResponse(true, 'Project updated successfully.', { project })
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Handles deleting a project.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.projectService.deleteProject(id, req.user.id);

      res.status(200).json(
        formatStandardResponse(true, 'Project deleted successfully.')
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Handles retrieving a project by ID.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectById(id, req.user.id);

      res.status(200).json(
        formatStandardResponse(true, 'Project retrieved successfully.', { project })
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Handles listing projects for the authenticated user.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  getAll = async (req, res, next) => {
    try {
      const { page, limit, search, status } = req.query;
      const result = await this.projectService.listProjects(req.user.id, {
        page,
        limit,
        search,
        status,
      });

      res.status(200).json(
        formatStandardResponse(true, 'Projects retrieved successfully.', result)
      );
    } catch (err) {
      next(err);
    }
  };
}
