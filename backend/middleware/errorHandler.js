const config = require('../config');

/**
 * Global Express error-handling middleware.
 * Must be registered AFTER all routes.
 *
 * @param {Error} err
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
function errorHandler(err, _req, res, _next) {
  // Log full error in non-production environments
  if (config.nodeEnv !== 'production') {
    console.error('🔥 Unhandled error:', err);
  } else {
    console.error('🔥 Unhandled error:', err.message);
  }

  // Multer-specific errors (file too large, wrong type, etc.)
  if (err.name === 'MulterError') {
    const messages = {
      LIMIT_FILE_SIZE: `File too large — maximum size is ${config.maxFileSize / (1024 * 1024)} MB`,
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
      LIMIT_FILE_COUNT: 'Too many files',
    };
    return res.status(400).json({
      success: false,
      message: messages[err.code] || err.message,
    });
  }

  // Prisma known request errors (unique constraint, not found, etc.)
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      success: false,
      message: 'Database error — please check your request',
      ...(config.nodeEnv !== 'production' && { detail: err.message }),
    });
  }

  // JSON parse errors from malformed request bodies
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
    });
  }

  // Default: Internal Server Error
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: config.nodeEnv === 'production' ? 'Internal Server Error' : err.message,
    ...(config.nodeEnv !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
