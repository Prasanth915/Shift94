import { formatStandardResponse } from '../../../../shared/helpers/index.js';

/**
 * Controller handling HTTP request/response parsing for Publish History endpoints.
 * Enforces the Controller Layer, utilizing HistoryService and PublishService via Dependency Injection.
 */
export class HistoryController {
  /**
   * @param {HistoryService} historyService
   * @param {PublishService} publishService
   * @param {PublishLogRepository} logRepository
   */
  constructor(historyService, publishService, logRepository) {
    this.historyService = historyService;
    this.publishService = publishService;
    this.logRepository = logRepository;
  }

  /**
   * Retrieves a paginated, filtered list of publish logs for the user.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  getAll = async (req, res, next) => {
    try {
      const { page, limit, platform, status, search } = req.query;
      
      const result = await this.historyService.getHistory(req.user.id, {
        page,
        limit,
        platform,
        status,
        search,
      });

      res.status(200).json(
        formatStandardResponse(true, 'Publish history retrieved.', result)
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Retrieves a specific publish log by ID, verifying ownership.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const log = await this.logRepository.findById(id);

      if (!log) {
        const error = new Error('Publish log not found.');
        error.statusCode = 404;
        throw error;
      }

      // Verify ownership via the associated project's creator ID
      if (log.project.userId !== req.user.id) {
        const error = new Error('You do not have permission to view this publish log.');
        error.statusCode = 403;
        throw error;
      }

      res.status(200).json(
        formatStandardResponse(true, 'Publish log details retrieved.', { log })
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Retries a failed publishing log entry.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  retry = async (req, res, next) => {
    try {
      const { id } = req.params;
      const log = await this.logRepository.findById(id);

      if (!log) {
        const error = new Error('Publish log not found.');
        error.statusCode = 404;
        throw error;
      }

      // Verify that the entry is actually in a FAILED state before retrying
      if (log.status !== 'FAILED') {
        const error = new Error('Only failed publishing attempts can be retried.');
        error.statusCode = 400;
        throw error;
      }

      const result = await this.publishService.retryPublish(id, req.user.id);

      res.status(200).json(
        formatStandardResponse(true, 'Publish retry process completed.', { log: result })
      );
    } catch (err) {
      next(err);
    }
  };
}
