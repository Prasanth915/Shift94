import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { formatStandardResponse } from '../../shared/helpers/index.js';

/**
 * Authentication middleware that protects endpoints from unauthorized access.
 * Extracts the Bearer token from the Authorization header, validates it, and attaches the decoded payload to the request.
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        formatStandardResponse(false, 'Authentication required. Please log in.', null, [
          { message: 'Missing or malformed Authorization header' },
        ])
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    // Attach decoded user info to request context
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (err) {
    let message = 'Invalid or expired session token.';
    if (err.name === 'TokenExpiredError') {
      message = 'Session expired. Please log in again.';
    }

    return res.status(401).json(
      formatStandardResponse(false, message, null, [
        { message: err.message },
      ])
    );
  }
};

export default authMiddleware;
