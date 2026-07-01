const { Router } = require('express');
const { body, param } = require('express-validator');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const controller = require('../controllers/project.controller');

const router = Router();

// All project routes require authentication
router.use(auth);

/**
 * POST /api/project
 */
router.post(
  '/',
  upload.single('image'),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title must be at most 200 characters'),
    body('subtitle')
      .optional()
      .trim()
      .isLength({ max: 300 })
      .withMessage('Subtitle must be at most 300 characters'),
    body('description')
      .optional()
      .trim(),
    body('githubUrl')
      .optional()
      .trim()
      .isURL()
      .withMessage('GitHub URL must be a valid URL'),
    body('demoUrl')
      .optional()
      .trim()
      .isURL()
      .withMessage('Demo URL must be a valid URL'),
    body('techStack')
      .optional()
      .custom((value) => {
        // Accept both JSON string and array
        if (typeof value === 'string') {
          try { JSON.parse(value); } catch { throw new Error('techStack must be a valid JSON array'); }
        }
        return true;
      }),
    body('tags')
      .optional()
      .custom((value) => {
        if (typeof value === 'string') {
          try { JSON.parse(value); } catch { throw new Error('tags must be a valid JSON array'); }
        }
        return true;
      }),
    body('status')
      .optional()
      .isIn(['DRAFT', 'PUBLISHED'])
      .withMessage('Status must be DRAFT or PUBLISHED'),
  ],
  validate,
  controller.create,
);

/**
 * GET /api/project
 */
router.get('/', controller.getAll);

/**
 * GET /api/project/:id
 */
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid project ID')],
  validate,
  controller.getById,
);

/**
 * PUT /api/project/:id
 */
router.put(
  '/:id',
  upload.single('image'),
  [
    param('id').isUUID().withMessage('Invalid project ID'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Title must be at most 200 characters'),
    body('subtitle')
      .optional()
      .trim()
      .isLength({ max: 300 }),
    body('githubUrl')
      .optional()
      .trim()
      .isURL()
      .withMessage('GitHub URL must be a valid URL'),
    body('demoUrl')
      .optional()
      .trim()
      .isURL()
      .withMessage('Demo URL must be a valid URL'),
    body('status')
      .optional()
      .isIn(['DRAFT', 'PUBLISHED'])
      .withMessage('Status must be DRAFT or PUBLISHED'),
  ],
  validate,
  controller.update,
);

/**
 * DELETE /api/project/:id
 */
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid project ID')],
  validate,
  controller.remove,
);

module.exports = router;
