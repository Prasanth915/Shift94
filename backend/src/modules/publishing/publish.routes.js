import express from 'express';
import { PublishService } from './publish.service.js';
import { PublishLogRepository } from './publish-log.repository.js';
import { ProjectRepository } from '../projects/project.repository.js';
import { ConnectedAccountRepository } from '../oauth/account.repository.js';
import publisherManager from '../../../publishers/publisher.manager.js';
import { PublishController } from './publish.controller.js';
import { publishValidator } from './publish.validator.js';
import authMiddleware from '../../../middleware/auth.js';

const router = express.Router();

// 1. Instantiate collaborators manually (Dependency Injection)
const projectRepository = new ProjectRepository();
const accountRepository = new ConnectedAccountRepository();
const logRepository = new PublishLogRepository();

const publishService = new PublishService(
  projectRepository,
  accountRepository,
  logRepository,
  publisherManager
);
const publishController = new PublishController(publishService);

// 2. Define routes (authenticated)
router.post('/', authMiddleware, publishValidator, publishController.publish);

export default router;
