import express from 'express';
import { UserRepository } from '../auth/user.repository.js';
import { ConnectedAccountRepository } from '../oauth/account.repository.js';
import { SettingsService } from './settings.service.js';
import { SettingsController } from './settings.controller.js';
import { updateProfileValidator, changePasswordValidator } from './settings.validator.js';
import authMiddleware from '../../../middleware/auth.js';

const router = express.Router();

// 1. Instantiate collaborators manually (Dependency Injection)
const userRepository = new UserRepository();
const accountRepository = new ConnectedAccountRepository();
const settingsService = new SettingsService(userRepository, accountRepository);
const settingsController = new SettingsController(settingsService);

// All settings endpoints require authentication
router.use(authMiddleware);

// 2. Define routes
router.get('/profile', settingsController.getProfile);
router.put('/profile', updateProfileValidator, settingsController.updateProfile);
router.patch('/password', changePasswordValidator, settingsController.changePassword);
router.get('/accounts', settingsController.getAccounts);
router.delete('/accounts/github', settingsController.disconnectGitHub);
router.delete('/accounts/linkedin', settingsController.disconnectLinkedIn);

export default router;
