const { Router } = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const controller = require('../controllers/auth.controller');

const router = Router();

/**
 * POST /api/auth/register
 */
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 100 })
      .withMessage('Name must be at most 100 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('A valid email is required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/\d/)
      .withMessage('Password must contain at least one number'),
  ],
  validate,
  controller.register,
);

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('A valid email is required')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validate,
  controller.login,
);

/**
 * GET /api/auth/profile
 */
router.get('/profile', auth, controller.getProfile);

/**
 * PUT /api/auth/profile
 */
router.put(
  '/profile',
  auth,
  upload.single('avatar'),
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters'),
  ],
  validate,
  controller.updateProfile,
);

/**
 * PUT /api/auth/password
 */
router.put(
  '/password',
  auth,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/\d/)
      .withMessage('New password must contain at least one number'),
  ],
  validate,
  controller.changePassword,
);

module.exports = router;
