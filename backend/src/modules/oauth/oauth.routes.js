import express from 'express';
import { ConnectedAccountRepository } from './account.repository.js';
import { OAuthService } from './oauth.service.js';
import { GitHubService } from '../../../services/github.service.js';
import { LinkedInService } from '../../../services/linkedin.service.js';
import { OAuthController } from './oauth.controller.js';
import authMiddleware from '../../../middleware/auth.js';

const router = express.Router();

// 1. Instantiate collaborators manually (Dependency Injection)
const accountRepository = new ConnectedAccountRepository();
const oauthService = new OAuthService(accountRepository);
const githubService = new GitHubService();
const linkedinService = new LinkedInService();
const oauthController = new OAuthController(oauthService, githubService, linkedinService);

// 2. Define routes
// GitHub OAuth
router.get('/github', authMiddleware, oauthController.connectGitHub);
router.get('/github/callback', oauthController.githubCallback);
router.get('/github/status', authMiddleware, oauthController.getGitHubStatus);
router.post('/github/disconnect', authMiddleware, oauthController.disconnectGitHub);
router.get('/github/repositories', authMiddleware, oauthController.getGitHubRepositories);

// LinkedIn OAuth
router.get('/linkedin', authMiddleware, oauthController.connectLinkedIn);
router.get('/linkedin/callback', oauthController.linkedinCallback);
router.get('/linkedin/status', authMiddleware, oauthController.getLinkedInStatus);
router.post('/linkedin/disconnect', authMiddleware, oauthController.disconnectLinkedIn);

export default router;
