import { body } from 'express-validator';
import validateRequest from '../../../middleware/validate.js';
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '../../../../shared/constants/index.js';
import { validatePasswordStrength } from '../../../../shared/validators/index.js';

/**
 * Validation chains for authentication requests using express-validator.
 * Wires the shared validation logic into the Express middleware pipeline.
 */
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters.'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please enter a valid email address.'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH })
    .withMessage(`Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`)
    .custom((value) => {
      if (!validatePasswordStrength(value)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      }
      return true;
    }),
  
  validateRequest,
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please enter a valid email address.'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
  
  validateRequest,
];
