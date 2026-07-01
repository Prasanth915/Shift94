import { validateProjectInput } from '../../../../shared/validators/index.js';
import { calculatePagination } from '../../../../shared/helpers/index.js';
import fs from 'fs';
import path from 'path';
import config from '../../../config/index.js';

/**
 * Service orchestrating project creation, updates, and listings.
 * Enforces the Service Layer Pattern, utilizing ProjectRepository via Dependency Injection.
 */
export class ProjectService {
  /**
   * @param {ProjectRepository} projectRepository
   */
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  /**
   * Creates a new project showcase.
   * @param {string} userId - Owner UUID
   * @param {object} data - Project data
   * @returns {Promise<object>}
   */
  async createProject(userId, data) {
    // Validate input using shared validators
    const validationErrors = validateProjectInput(data);
    if (validationErrors) {
      const error = new Error(validationErrors[0]);
      error.statusCode = 422;
      throw error;
    }

    return this.projectRepository.create({
      userId,
      title: data.title,
      subtitle: data.subtitle || null,
      description: data.description,
      image: data.image || null,
      githubUrl: data.githubUrl || null,
      demoUrl: data.demoUrl || null,
      techStack: data.techStack,
      tags: data.tags || [],
      status: data.status || 'DRAFT',
    });
  }

  /**
   * Updates an existing project, verifying ownership.
   * @param {string} id - Project UUID
   * @param {string} userId - Owner UUID
   * @param {object} data - Project updates
   * @returns {Promise<object>}
   */
  async updateProject(id, userId, data) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      const error = new Error('Project not found.');
      error.statusCode = 404;
      throw error;
    }

    if (project.userId !== userId) {
      const error = new Error('You do not have permission to modify this project.');
      error.statusCode = 403;
      throw error;
    }

    return this.projectRepository.update(id, data);
  }

  /**
   * Deletes a project, verifying ownership.
   * @param {string} id - Project UUID
   * @param {string} userId - Owner UUID
   * @returns {Promise<boolean>}
   */
  async deleteProject(id, userId) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      const error = new Error('Project not found.');
      error.statusCode = 404;
      throw error;
    }

    if (project.userId !== userId) {
      const error = new Error('You do not have permission to delete this project.');
      error.statusCode = 403;
      throw error;
    }

    // Unlink cover image if it exists
    if (project.image && project.image.startsWith('/uploads/')) {
      const filename = project.image.replace(/^\/uploads\//, '');
      const filePath = path.join(config.uploadPath, filename);
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (err) {
        console.error(`Failed to delete project cover image file: ${filePath}`, err);
      }
    }

    return this.projectRepository.delete(id);
  }

  /**
   * Retrieves a project by ID, verifying ownership.
   * @param {string} id - Project UUID
   * @param {string} userId - Owner UUID
   * @returns {Promise<object>}
   */
  async getProjectById(id, userId) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      const error = new Error('Project not found.');
      error.statusCode = 404;
      throw error;
    }

    if (project.userId !== userId) {
      const error = new Error('You do not have permission to view this project.');
      error.statusCode = 403;
      throw error;
    }

    return project;
  }

  /**
   * Retrieves a paginated list of projects for a user.
   * @param {string} userId - Owner UUID
   * @param {object} query - Query parameters (page, limit, search, status)
   * @returns {Promise<{ projects: object[], pagination: object }>}
   */
  async listProjects(userId, query = {}) {
    const { skip, take } = calculatePagination(query.page, query.limit);

    const filter = {
      userId,
      status: query.status,
      search: query.search,
      skip,
      take,
    };

    const [projects, total] = await Promise.all([
      this.projectRepository.findAll(filter),
      this.projectRepository.count(filter),
    ]);

    const limit = take;
    const page = Math.floor(skip / limit) + 1;

    return {
      projects,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
