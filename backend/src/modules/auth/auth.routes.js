import express from 'express';
import { UserRepository } from './user.repository.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { registerValidator, loginValidator } from './auth.validator.js';
import authMiddleware from '../../../middleware/auth.js';

const router = express.Router();

// 1. Instantiate collaborators manually (Dependency Injection)
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// 2. Define routes
router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.get('/me', authMiddleware, authController.getMe);

export default router;
