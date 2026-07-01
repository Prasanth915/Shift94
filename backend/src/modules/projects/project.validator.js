import { body, param, query } from 'express-validator';
import validateRequest from '../../../middleware/validate.js';
import { validateUrl, validateUuid } from '../../../../shared/validators/index.js';

/**
 * Validation chains for project requests.
 * Integrates express-validator with shared helper functions.
 */
export const createProjectValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required.')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters.'),

  body('subtitle')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Subtitle must not exceed 255 characters.'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required.'),

  body('githubUrl')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!validateUrl(value)) {
        throw new Error('Please enter a valid GitHub repository URL.');
      }
      return true;
    }),

  body('demoUrl')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!validateUrl(value)) {
        throw new Error('Please enter a valid Live Demo URL.');
      }
      return true;
    }),

  body('techStack')
    .custom((value) => {
      // In multipart form data, arrays might be sent as JSON strings or comma-separated strings
      let parsed = value;
      if (typeof value === 'string') {
        try {
          parsed = JSON.parse(value);
        } catch {
          parsed = value.split(',').map((item) => item.trim());
        }
      }
      if (!Array.isArray(parsed) || parsed.length === 0 || parsed.some((item) => !item)) {
        throw new Error('At least one technology is required in the tech stack.');
      }
      return true;
    }),

  body('tags')
    .optional()
    .custom((value) => {
      if (!value) return true;
      let parsed = value;
      if (typeof value === 'string') {
        try {
          parsed = JSON.parse(value);
        } catch {
          parsed = value.split(',').map((item) => item.trim());
        }
      }
      if (!Array.isArray(parsed)) {
        throw new Error('Tags must be an array or comma-separated string.');
      }
      return true;
    }),

  body('platforms')
    .optional()
    .custom((value) => {
      if (!value) return true;
      let parsed = value;
      if (typeof value === 'string') {
        try {
          parsed = JSON.parse(value);
        } catch {
          parsed = value.split(',').map((item) => item.trim());
        }
      }
      if (!Array.isArray(parsed)) {
        throw new Error('Platforms must be an array.');
      }
      const allowed = ['LINKEDIN', 'GITHUB'];
      const invalid = parsed.filter((p) => !allowed.includes(p.toUpperCase()));
      if (invalid.length > 0) {
        throw new Error(`Platforms contains unsupported values: ${invalid.join(', ')}. Instagram and Portfolio are coming soon.`);
      }
      return true;
    }),

  validateRequest,
];

export const updateProjectValidator = [
  param('id')
    .custom((value) => {
      if (!validateUuid(value)) {
        throw new Error('Invalid project identifier format.');
      }
      return true;
    }),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project title cannot be empty.')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters.'),

  body('subtitle')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Subtitle must not exceed 255 characters.'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project description cannot be empty.'),

  body('githubUrl')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!validateUrl(value)) {
        throw new Error('Please enter a valid GitHub repository URL.');
      }
      return true;
    }),

  body('demoUrl')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!validateUrl(value)) {
        throw new Error('Please enter a valid Live Demo URL.');
      }
      return true;
    }),

  body('techStack')
    .optional()
    .custom((value) => {
      let parsed = value;
      if (typeof value === 'string') {
        try {
          parsed = JSON.parse(value);
        } catch {
          parsed = value.split(',').map((item) => item.trim());
        }
      }
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('At least one technology is required in the tech stack.');
      }
      return true;
    }),

  validateRequest,
];

export const getProjectValidator = [
  param('id')
    .custom((value) => {
      if (!validateUuid(value)) {
        throw new Error('Invalid project identifier format.');
      }
      return true;
    }),
  validateRequest,
];

export const listProjectsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100.'),
  
  validateRequest,
];
