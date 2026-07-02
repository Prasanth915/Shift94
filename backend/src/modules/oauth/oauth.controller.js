import crypto from 'crypto';
import config from '../../../config/index.js';
import { formatStandardResponse } from '../../../../shared/helpers/index.js';

/**
 * Controller handling HTTP request/response parsing for OAuth, GitHub, and LinkedIn endpoints.
 * Enforces the Controller Layer, utilizing OAuthService, GitHubService, and LinkedInService via Dependency Injection.
 */
export class OAuthController {
  /**
   * @param {OAuthService} oauthService
   * @param {GitHubService} githubService
   * @param {LinkedInService} linkedinService
   */
  constructor(oauthService, githubService, linkedinService) {
    this.oauthService = oauthService;
    this.githubService = githubService;
    this.linkedinService = linkedinService;
  }

  /**
   * Initiates the LinkedIn OAuth authorization flow.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  connectLinkedIn = async (req, res, next) => {
    try {
      const random = crypto.randomBytes(16).toString('hex');
      const state = `${req.user.id}:${random}`;
      
      res.cookie('linkedin_oauth_state', state, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        maxAge: 10 * 60 * 1000,
      });

      const url = this.oauthService.getAuthUrl('LINKEDIN', state);

      res.status(200).json(
        formatStandardResponse(true, 'LinkedIn authorization URL generated.', { url, state })
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Handles the LinkedIn OAuth redirect callback.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  linkedinCallback = async (req, res, next) => {
    try {
      const { code, state } = req.query;
      const savedState = req.cookies.linkedin_oauth_state;

      if (!state || state !== savedState) {
        res.clearCookie('linkedin_oauth_state');
        return res.redirect(
          `${config.appUrl}/oauth/callback?platform=linkedin&status=error&message=CSRF_validation_failed`
        );
      }

      res.clearCookie('linkedin_oauth_state');

      const { accessToken } = await this.linkedinService.getAccessToken(
        config.linkedin.clientId,
        config.linkedin.clientSecret,
        code,
        config.linkedin.redirectUri
      );

      const profile = await this.linkedinService.getUserProfile(accessToken);

      const userId = state.split(':')[0];
      if (!userId) {
        throw new Error('User context not found in session.');
      }

      await this.oauthService.saveConnection(userId, {
        platform: 'LINKEDIN',
        accessToken,
        refreshToken: null,
        username: profile.name,
        profileUrl: `https://linkedin.com/in/${profile.id}`,
      });

      res.redirect(`${config.appUrl}/oauth/callback?platform=linkedin&status=success`);
    } catch (err) {
      res.redirect(
        `${config.appUrl}/oauth/callback?platform=linkedin&status=error&message=${encodeURIComponent(err.message)}`
      );
    }
  };

  /**
   * Checks the connection status for LinkedIn.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  getLinkedInStatus = async (req, res, next) => {
    try {
      const accounts = await this.oauthService.getConnectedAccounts(req.user.id);
      const linkedin = accounts.find((acc) => acc.platform === 'LINKEDIN');

      res.status(200).json(
        formatStandardResponse(true, 'LinkedIn connection status retrieved.', {
          connected: !!linkedin,
          account: linkedin || null,
        })
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Disconnects a LinkedIn account.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  disconnectLinkedIn = async (req, res, next) => {
    try {
      await this.oauthService.disconnect(req.user.id, 'LINKEDIN');

      res.status(200).json(
        formatStandardResponse(true, 'LinkedIn account disconnected successfully.')
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Initiates the GitHub OAuth authorization flow.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  connectGitHub = async (req, res, next) => {
    try {
      // Generate a state token that encodes user context for CSRF protection & sessionless correlation
      const random = crypto.randomBytes(16).toString('hex');
      const state = `${req.user.id}:${random}`;
      
      // Store state in cookie to validate on callback
      res.cookie('github_oauth_state', state, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });

      const url = this.oauthService.getAuthUrl('GITHUB', state);

      res.status(200).json(
        formatStandardResponse(true, 'GitHub authorization URL generated.', { url, state })
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Handles the GitHub OAuth redirect callback.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  githubCallback = async (req, res, next) => {
    try {
      const { code, state } = req.query;
      const savedState = req.cookies.github_oauth_state;

      // CSRF state validation
      if (!state || state !== savedState) {
        res.clearCookie('github_oauth_state');
        return res.redirect(
          `${config.appUrl}/oauth/callback?platform=github&status=error&message=CSRF_validation_failed`
        );
      }

      res.clearCookie('github_oauth_state');

      // Exchange code for access token
      const { accessToken } = await this.githubService.getAccessToken(
        config.github.clientId,
        config.github.clientSecret,
        code,
        config.github.redirectUri
      );

      // Fetch user profile info
      const profile = await this.githubService.getUserProfile(accessToken);

      // Save connection
      const userId = state.split(':')[0];
      if (!userId) {
        throw new Error('User context not found in session.');
      }

      await this.oauthService.saveConnection(userId, {
        platform: 'GITHUB',
        accessToken,
        refreshToken: null,
        username: profile.username,
        profileUrl: profile.profileUrl,
      });

      // Redirect back to frontend
      res.redirect(`${config.appUrl}/oauth/callback?platform=github&status=success`);
    } catch (err) {
      res.redirect(
        `${config.appUrl}/oauth/callback?platform=github&status=error&message=${encodeURIComponent(err.message)}`
      );
    }
  };

  /**
   * Checks the connection status for GitHub.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  getGitHubStatus = async (req, res, next) => {
    try {
      const accounts = await this.oauthService.getConnectedAccounts(req.user.id);
      const github = accounts.find((acc) => acc.platform === 'GITHUB');

      res.status(200).json(
        formatStandardResponse(true, 'GitHub connection status retrieved.', {
          connected: !!github,
          account: github || null,
        })
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Disconnects a GitHub account.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  disconnectGitHub = async (req, res, next) => {
    try {
      await this.oauthService.disconnect(req.user.id, 'GITHUB');

      res.status(200).json(
        formatStandardResponse(true, 'GitHub account disconnected successfully.')
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Fetches the user's GitHub repositories.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  getGitHubRepositories = async (req, res, next) => {
    try {
      const accessToken = await this.oauthService.getDecryptedAccessToken(req.user.id, 'GITHUB');
      const repositories = await this.githubService.getUserRepositories(accessToken);

      res.status(200).json(
        formatStandardResponse(true, 'GitHub repositories retrieved successfully.', { repositories })
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Checks the availability of a repository name on GitHub.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  checkGitHubRepositoryName = async (req, res, next) => {
    try {
      const { name } = req.query;
      if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Repository name is required.');
        error.statusCode = 400;
        throw error;
      }

      const accessToken = await this.oauthService.getDecryptedAccessToken(req.user.id, 'GITHUB');
      const accounts = await this.oauthService.getConnectedAccounts(req.user.id);
      const github = accounts.find((acc) => acc.platform === 'GITHUB');
      if (!github || !github.username) {
        const error = new Error('GitHub account is not connected.');
        error.statusCode = 400;
        throw error;
      }

      const owner = github.username;
      
      try {
        await this.githubService.checkRepositoryAccess(accessToken, owner, name.trim());
        // If it returns successfully, repository already exists
        res.status(200).json(
          formatStandardResponse(true, 'Repository name availability checked.', { available: false, reason: 'ALREADY_EXISTS' })
        );
      } catch (checkErr) {
        if (checkErr.statusCode === 404) {
          res.status(200).json(
            formatStandardResponse(true, 'Repository name availability checked.', { available: true })
          );
        } else {
          throw checkErr;
        }
      }
    } catch (err) {
      next(err);
    }
  };

  /**
   * Creates a new GitHub repository for the authenticated user.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  createGitHubRepository = async (req, res, next) => {
    try {
      const { name, description, private: isPrivate, autoInit, gitignoreTemplate, licenseTemplate, topics } = req.body;
      
      if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Repository name is required.');
        error.statusCode = 400;
        throw error;
      }

      if (!/^[a-z0-9_.-]+$/i.test(name.trim())) {
        const error = new Error('Invalid repository name.');
        error.statusCode = 422;
        throw error;
      }

      const accessToken = await this.oauthService.getDecryptedAccessToken(req.user.id, 'GITHUB');
      
      const repo = await this.githubService.createRepository(accessToken, {
        name: name.trim(),
        description: description || '',
        private: !!isPrivate,
        autoInit: autoInit !== false,
        gitignoreTemplate: gitignoreTemplate || null,
        licenseTemplate: licenseTemplate || null,
        topics: topics || [],
      });

      res.status(201).json(
        formatStandardResponse(true, 'GitHub repository created successfully.', { repository: repo })
      );
    } catch (err) {
      next(err);
    }
  };
}
