import { formatStandardResponse } from '../../../../shared/helpers/index.js';

/**
 * Controller handling HTTP request/response parsing for Dashboard endpoints.
 * Enforces the Controller Layer, utilizing HistoryService and ProjectService via Dependency Injection.
 */
export class DashboardController {
  /**
   * @param {HistoryService} historyService
   * @param {ProjectService} projectService
   */
  constructor(historyService, projectService) {
    this.historyService = historyService;
    this.projectService = projectService;
  }

  /**
   * Retrieves dashboard statistics (Total Projects, Published Projects, LinkedIn and GitHub connection flags).
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  getDashboardData = async (req, res, next) => {
    try {
      const stats = await this.historyService.getDashboardStats(req.user.id);

      res.status(200).json(
        formatStandardResponse(true, 'Dashboard statistics retrieved.', stats)
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Retrieves the 5 most recently created projects.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  getRecentProjects = async (req, res, next) => {
    try {
      const result = await this.projectService.listProjects(req.user.id, {
        page: 1,
        limit: 5,
      });

      res.status(200).json(
        formatStandardResponse(true, 'Recent projects retrieved.', {
          projects: result.projects,
        })
      );
    } catch (err) {
      next(err);
    }
  };
}
