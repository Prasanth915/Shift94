import express from 'express';
import { ProjectRepository } from './project.repository.js';
import { ProjectService } from './project.service.js';
import { ProjectController } from './project.controller.js';
import {
  createProjectValidator,
  updateProjectValidator,
  getProjectValidator,
  listProjectsValidator,
} from './project.validator.js';
import authMiddleware from '../../../middleware/auth.js';
import upload from '../../../middleware/upload.js';

const router = express.Router();

// 1. Instantiate collaborators manually (Dependency Injection)
const projectRepository = new ProjectRepository();
const projectService = new ProjectService(projectRepository);
const projectController = new ProjectController(projectService);

// All routes in Project Management require authentication
router.use(authMiddleware);

// 2. Define routes
router.post('/', upload.single('image'), createProjectValidator, projectController.create);
router.get('/', listProjectsValidator, projectController.getAll);
router.get('/:id', getProjectValidator, projectController.getById);
router.put('/:id', upload.single('image'), updateProjectValidator, projectController.update);
router.delete('/:id', getProjectValidator, projectController.delete);

export default router;
