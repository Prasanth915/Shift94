import express from 'express';
import { HistoryService } from './history.service.js';
import { ProjectService } from '../projects/project.service.js';
import { PublishLogRepository } from '../publishing/publish-log.repository.js';
import { ProjectRepository } from '../projects/project.repository.js';
import { ConnectedAccountRepository } from '../oauth/account.repository.js';
import { DashboardController } from './dashboard.controller.js';
import authMiddleware from '../../../middleware/auth.js';

const router = express.Router();

// 1. Instantiate collaborators manually (Dependency Injection)
const logRepository = new PublishLogRepository();
const projectRepository = new ProjectRepository();
const accountRepository = new ConnectedAccountRepository();

const historyService = new HistoryService(logRepository, projectRepository, accountRepository);
const projectService = new ProjectService(projectRepository);
const dashboardController = new DashboardController(historyService, projectService);

// All dashboard endpoints require authentication
router.use(authMiddleware);

// 2. Define routes
router.get('/', dashboardController.getDashboardData);
router.get('/recent-projects', dashboardController.getRecentProjects);

export default router;
