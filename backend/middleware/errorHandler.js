import { logger } from '../utils/logger.js';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Centralized error handling middleware for Express.
 * - Never exposes stack traces in production.
 * - Uses structured logger instead of console.error.
 * - Returns consistent JSON error responses.
 */
export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;

  // Log with appropriate level
  if (statusCode >= 500) {
    logger.error(`[${req.method} ${req.path}] ${err.message}`, err);
  } else {
    logger.warn(`[${req.method} ${req.path}] ${statusCode} — ${err.message}`);
  }

  // If headers already sent (e.g., mid-stream), just end the response
  if (res.headersSent) {
    return res.end();
  }

  // Sanitize error message for production — never expose internal details for 500s
  const clientMessage =
    isProd && statusCode === 500
      ? 'An internal server error occurred. Please try again later.'
      : err.message || 'Internal server error.';

  res.status(statusCode).json({
    error: clientMessage,
    errorType: err.errorType || 'INTERNAL_ERROR',
    // Stack traces are only included in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
