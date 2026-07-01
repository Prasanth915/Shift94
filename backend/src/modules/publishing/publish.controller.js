import { formatStandardResponse } from '../../../../shared/helpers/index.js';

/**
 * Controller handling HTTP requests for the project publishing flow.
 * Enforces the Controller Layer, utilizing PublishService via Dependency Injection.
 */
export class PublishController {
  /**
   * @param {PublishService} publishService
   */
  constructor(publishService) {
    this.publishService = publishService;
  }

  /**
   * Handles publishing a project to selected platforms.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  publish = async (req, res, next) => {
    try {
      const { projectId, platforms } = req.body;
      const userId = req.user.id;

      const results = await this.publishService.publishProject(projectId, userId, platforms);

      res.status(200).json(
        formatStandardResponse(true, 'Publishing process completed.', { results })
      );
    } catch (err) {
      next(err);
    }
  };
}
