const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');
const { encrypt, decrypt } = require('../utils/encryption');
const { success, error } = require('../utils/apiResponse');
const linkedinService = require('../services/linkedin.service');
const githubService = require('../services/github.service');

const prisma = new PrismaClient();

// ─── LinkedIn ─────────────────────────────────────────────────────────────────

/**
 * GET /api/oauth/linkedin
 * Redirect the user to LinkedIn's OAuth consent screen.
 */
async function linkedinAuth(req, res, next) {
  try {
    const state = crypto.randomBytes(16).toString('hex');
    // Store state in a short-lived cookie for CSRF verification
    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      maxAge: 10 * 60 * 1000, // 10 minutes
      sameSite: 'lax',
    });

    const url = linkedinService.getAuthUrl(state);
    return res.redirect(url);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/oauth/linkedin/callback
 * Handle LinkedIn OAuth callback — exchange code, store encrypted token, redirect to frontend.
 */
async function linkedinCallback(req, res, next) {
  try {
    const { code, state, error: oauthError } = req.query;
    const frontendBase = config.appUrl;

    if (oauthError) {
      return res.redirect(`${frontendBase}/oauth/callback?platform=linkedin&status=error&message=${encodeURIComponent(oauthError)}`);
    }

    // Validate state (CSRF protection)
    const savedState = req.cookies?.oauth_state;
    if (!savedState || savedState !== state) {
      return res.redirect(`${frontendBase}/oauth/callback?platform=linkedin&status=error&message=invalid_state`);
    }
    res.clearCookie('oauth_state');

    // Exchange code for tokens
    const tokens = await linkedinService.exchangeCodeForToken(code);

    // Fetch profile
    const profile = await linkedinService.getProfile(tokens.accessToken);

    // Upsert connected account with encrypted tokens
    await prisma.connectedAccount.upsert({
      where: {
        userId_platform: {
          userId: req.user?.userId || req.query.userId,
          platform: 'LINKEDIN',
        },
      },
      update: {
        accessToken: encrypt(tokens.accessToken),
        refreshToken: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
        username: profile.name,
        profileUrl: `https://www.linkedin.com/in/${profile.sub}`,
        status: 'CONNECTED',
      },
      create: {
        userId: req.user?.userId || req.query.userId,
        platform: 'LINKEDIN',
        accessToken: encrypt(tokens.accessToken),
        refreshToken: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
        username: profile.name,
        profileUrl: `https://www.linkedin.com/in/${profile.sub}`,
        status: 'CONNECTED',
      },
    });

    return res.redirect(`${frontendBase}/oauth/callback?platform=linkedin&status=success`);
  } catch (err) {
    console.error('LinkedIn OAuth callback error:', err.message);
    return res.redirect(`${config.appUrl}/oauth/callback?platform=linkedin&status=error&message=${encodeURIComponent('Authentication failed')}`);
  }
}

// ─── GitHub ───────────────────────────────────────────────────────────────────

/**
 * GET /api/oauth/github
 * Redirect the user to GitHub's OAuth consent screen.
 */
async function githubAuth(req, res, next) {
  try {
    const state = crypto.randomBytes(16).toString('hex');
    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      maxAge: 10 * 60 * 1000,
      sameSite: 'lax',
    });

    const url = githubService.getAuthUrl(state);
    return res.redirect(url);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/oauth/github/callback
 * Handle GitHub OAuth callback.
 */
async function githubCallback(req, res, next) {
  try {
    const { code, state, error: oauthError } = req.query;
    const frontendBase = config.appUrl;

    if (oauthError) {
      return res.redirect(`${frontendBase}/oauth/callback?platform=github&status=error&message=${encodeURIComponent(oauthError)}`);
    }

    const savedState = req.cookies?.oauth_state;
    if (!savedState || savedState !== state) {
      return res.redirect(`${frontendBase}/oauth/callback?platform=github&status=error&message=invalid_state`);
    }
    res.clearCookie('oauth_state');

    // Exchange code for token
    const tokens = await githubService.exchangeCodeForToken(code);

    // Fetch profile
    const profile = await githubService.getProfile(tokens.accessToken);

    // Upsert connected account
    await prisma.connectedAccount.upsert({
      where: {
        userId_platform: {
          userId: req.user?.userId || req.query.userId,
          platform: 'GITHUB',
        },
      },
      update: {
        accessToken: encrypt(tokens.accessToken),
        refreshToken: null,
        username: profile.login,
        profileUrl: profile.profileUrl,
        status: 'CONNECTED',
      },
      create: {
        userId: req.user?.userId || req.query.userId,
        platform: 'GITHUB',
        accessToken: encrypt(tokens.accessToken),
        refreshToken: null,
        username: profile.login,
        profileUrl: profile.profileUrl,
        status: 'CONNECTED',
      },
    });

    return res.redirect(`${frontendBase}/oauth/callback?platform=github&status=success`);
  } catch (err) {
    console.error('GitHub OAuth callback error:', err.message);
    return res.redirect(`${config.appUrl}/oauth/callback?platform=github&status=error&message=${encodeURIComponent('Authentication failed')}`);
  }
}

// ─── Shared ───────────────────────────────────────────────────────────────────

/**
 * GET /api/oauth/accounts
 * List all connected accounts for the authenticated user.
 * NEVER exposes tokens.
 */
async function getAccounts(req, res, next) {
  try {
    const accounts = await prisma.connectedAccount.findMany({
      where: { userId: req.user.userId },
      select: {
        id: true,
        platform: true,
        username: true,
        profileUrl: true,
        status: true,
        createdAt: true,
      },
    });
    return success(res, { accounts });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/oauth/:platform
 * Disconnect (delete) a connected account.
 */
async function disconnect(req, res, next) {
  try {
    const platform = req.params.platform.toUpperCase();
    const validPlatforms = ['LINKEDIN', 'GITHUB', 'INSTAGRAM', 'PORTFOLIO'];
    if (!validPlatforms.includes(platform)) {
      return error(res, 'Invalid platform', 400);
    }

    const account = await prisma.connectedAccount.findUnique({
      where: {
        userId_platform: {
          userId: req.user.userId,
          platform,
        },
      },
    });

    if (!account) {
      return error(res, 'Connected account not found', 404);
    }

    await prisma.connectedAccount.delete({ where: { id: account.id } });
    return success(res, null, `${platform} account disconnected`);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  linkedinAuth,
  linkedinCallback,
  githubAuth,
  githubCallback,
  getAccounts,
  disconnect,
};
