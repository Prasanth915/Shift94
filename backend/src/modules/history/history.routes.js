import express from 'express';
import { HistoryService } from './history.service.js';
import { PublishService } from '../publishing/publish.service.js';
import { PublishLogRepository } from '../publishing/publish-log.repository.js';
import { ProjectRepository } from '../projects/project.repository.js';
import { ConnectedAccountRepository } from '../oauth/account.repository.js';
import publisherManager from '../../../publishers/publisher.manager.js';
import { HistoryController } from './history.controller.js';
import { listHistoryValidator, retryValidator } from './history.validator.js';
import authMiddleware from '../../../middleware/auth.js';

const router = express.Router();

// 1. Instantiate collaborators manually (Dependency Injection)
const logRepository = new PublishLogRepository();
const projectRepository = new ProjectRepository();
const accountRepository = new ConnectedAccountRepository();

const historyService = new HistoryService(logRepository, projectRepository, accountRepository);
const publishService = new PublishService(
  projectRepository,
  accountRepository,
  logRepository,
  publisherManager
);
const historyController = new HistoryController(historyService, publishService, logRepository);

// All history endpoints require authentication
router.use(authMiddleware);

// 2. Define routes
router.get('/', listHistoryValidator, historyController.getAll);
router.get('/:id', retryValidator, historyController.getById);
router.post('/:id/retry', retryValidator, historyController.retry);

export default router;
