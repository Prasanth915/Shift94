const { Router } = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const controller = require('../controllers/publish.controller');

const router = Router();

// All publish routes require authentication
router.use(auth);

/**
 * POST /api/publish/linkedin
 */
router.post(
  '/linkedin',
  [
    body('projectId')
      .isUUID()
      .withMessage('Valid project ID is required'),
    body('text')
      .optional()
      .trim()
      .isLength({ max: 3000 })
      .withMessage('Post text must be at most 3000 characters'),
  ],
  validate,
  controller.publishToLinkedIn,
);

/**
 * POST /api/publish/github
 */
router.post(
  '/github',
  [
    body('projectId')
      .isUUID()
      .withMessage('Valid project ID is required'),
    body('repoUrl')
      .optional()
      .trim()
      .isURL()
      .withMessage('Repository URL must be a valid URL'),
    body('repoName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Repository name cannot be empty'),
    body('repoFullName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Repository full name cannot be empty'),
  ],
  validate,
  controller.publishToGitHub,
);

module.exports = router;
