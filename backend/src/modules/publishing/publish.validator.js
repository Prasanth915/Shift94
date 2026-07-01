import { body } from 'express-validator';
import validateRequest from '../../../middleware/validate.js';
import { validateUuid } from '../../../../shared/validators/index.js';

export const publishValidator = [
  body('projectId')
    .trim()
    .notEmpty()
    .withMessage('Project ID is required.')
    .custom((value) => {
      if (!validateUuid(value)) {
        throw new Error('Invalid project identifier format.');
      }
      return true;
    }),

  body('platforms')
    .custom((value) => {
      // Allow dynamic parsing if it's sent as a string/JSON
      let parsed = value;
      if (typeof value === 'string') {
        try {
          parsed = JSON.parse(value);
        } catch {
          parsed = value.split(',').map((item) => item.trim());
        }
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('At least one publishing platform is required.');
      }

      const validPlatforms = new Set(['GITHUB', 'LINKEDIN', 'INSTAGRAM', 'PORTFOLIO']);
      for (const p of parsed) {
        if (!p || typeof p !== 'string' || !validPlatforms.has(p.toUpperCase())) {
          throw new Error(`Unsupported publishing platform: ${p}`);
        }
      }

      return true;
    })
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value.split(',').map((item) => item.trim().toUpperCase());
        }
      }
      if (Array.isArray(value)) {
        return value.map(v => v.toUpperCase());
      }
      return value;
    }),

  validateRequest,
];
