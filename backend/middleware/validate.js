import { validationResult } from 'express-validator';
import { formatStandardResponse } from '../../shared/helpers/index.js';

/**
 * Middleware that checks the result of express-validator chains.
 * If validation errors exist, it halts the request and returns a 422 Unprocessable Entity response.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(422).json(
      formatStandardResponse(false, 'One or more fields failed validation.', null, formattedErrors)
    );
  }
  next();
};

export default validateRequest;
