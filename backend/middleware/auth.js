import jwt from 'jsonwebtoken';
// User DB model removed (Stateless architecture)
import { logger } from '../utils/logger.js';

/**
 * Authentication middleware.
 * Verifies the HttpOnly JWT cookie and attaches the user to the request.
 * Fails immediately if JWT_SECRET is not configured — never uses a fallback.
 */
export const requireAuth = async (req, res, next) => {
  // Refuse to operate without a proper JWT secret
  if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET is not configured. Authentication is disabled.');
    const error = new Error('Authentication service is not configured.');
    error.statusCode = 503;
    error.errorType = 'AUTH_MISCONFIGURED';
    return next(error);
  }

  try {
    const token = req.cookies?.repolens_auth;

    if (!token) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      error.errorType = 'AUTH_REQUIRED';
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.user) {
      const error = new Error('Invalid token payload');
      error.statusCode = 401;
      error.errorType = 'INVALID_TOKEN';
      throw error;
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      const error = new Error('Invalid authentication token');
      error.statusCode = 401;
      error.errorType = 'INVALID_TOKEN';
      next(error);
    } else if (err.name === 'TokenExpiredError') {
      const error = new Error('Authentication token has expired');
      error.statusCode = 401;
      error.errorType = 'TOKEN_EXPIRED';
      next(error);
    } else {
      next(err);
    }
  }
};
