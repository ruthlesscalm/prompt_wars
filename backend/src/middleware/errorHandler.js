const logger = require('../utils/logger');

/**
 * Global error handling middleware.
 * Catches all unhandled errors and sends a clean JSON response.
 */
function errorHandler(err, req, res, _next) {
  logger.error('Unhandled error:', err.message);
  logger.debug('Stack trace:', err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
