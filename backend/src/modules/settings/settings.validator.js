import { body } from 'express-validator';
import validateRequest from '../../../middleware/validate.js';
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '../../../../shared/constants/index.js';
import { validatePasswordStrength } from '../../../../shared/validators/index.js';

/**
 * Validation chains for settings requests.
 * Integrates express-validator with shared helper functions.
 */
export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty.')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters.'),

  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email cannot be empty.')
    .isEmail()
    .withMessage('Please enter a valid email address.'),

  validateRequest,
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required.'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required.')
    .isLength({ min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH })
    .withMessage(`New password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`)
    .custom((value) => {
      if (!validatePasswordStrength(value)) {
        throw new Error('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required.')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Confirm password does not match new password.');
      }
      return true;
    }),

  validateRequest,
];
