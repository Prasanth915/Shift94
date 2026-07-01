const { Router } = require('express');
const { param } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const controller = require('../controllers/oauth.controller');

const router = Router();

/**
 * GET /api/oauth/linkedin
 * Initiate LinkedIn OAuth flow.
 * NOTE: auth middleware is applied so we know which user is connecting.
 *       The userId is embedded in the state/cookie for the callback.
 */
router.get('/linkedin', auth, controller.linkedinAuth);

/**
 * GET /api/oauth/linkedin/callback
 * LinkedIn redirects here after consent.
 * Auth middleware is NOT applied — user comes from LinkedIn redirect.
 * userId is carried via cookie/state.
 */
router.get('/linkedin/callback', controller.linkedinCallback);

/**
 * GET /api/oauth/github
 * Initiate GitHub OAuth flow.
 */
router.get('/github', auth, controller.githubAuth);

/**
 * GET /api/oauth/github/callback
 * GitHub redirects here after consent.
 */
router.get('/github/callback', controller.githubCallback);

/**
 * GET /api/oauth/accounts
 * List all connected accounts (tokens are never exposed).
 */
router.get('/accounts', auth, controller.getAccounts);

/**
 * DELETE /api/oauth/:platform
 * Disconnect a platform account.
 */
router.delete(
  '/:platform',
  auth,
  [
    param('platform')
      .trim()
      .notEmpty()
      .withMessage('Platform is required')
      .isIn(['linkedin', 'github', 'instagram', 'portfolio', 'LINKEDIN', 'GITHUB', 'INSTAGRAM', 'PORTFOLIO'])
      .withMessage('Invalid platform — must be one of: linkedin, github, instagram, portfolio'),
  ],
  validate,
  controller.disconnect,
);

module.exports = router;
