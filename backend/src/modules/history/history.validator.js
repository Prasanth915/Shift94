import { query, param } from 'express-validator';
import validateRequest from '../../../middleware/validate.js';
import { validateUuid } from '../../../../shared/validators/index.js';

/**
 * Validation chains for publish history requests.
 * Integrates express-validator with shared helper functions.
 */
export const listHistoryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100.'),

  query('platform')
    .optional()
    .toUpperCase()
    .isIn(['LINKEDIN', 'GITHUB'])
    .withMessage('Platform must be either LINKEDIN or GITHUB.'),

  query('status')
    .optional()
    .toUpperCase()
    .isIn(['PENDING', 'PUBLISHING', 'PUBLISHED', 'FAILED'])
    .withMessage('Status must be PENDING, PUBLISHING, PUBLISHED, or FAILED.'),

  validateRequest,
];

export const retryValidator = [
  param('id')
    .custom((value) => {
      if (!validateUuid(value)) {
        throw new Error('Invalid publish log identifier format.');
      }
      return true;
    }),
  validateRequest,
];
