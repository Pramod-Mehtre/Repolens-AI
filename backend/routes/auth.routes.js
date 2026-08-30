import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
// User DB model removed (Stateless architecture)
import { requireAuth } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

export const authRouter = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Cookie configuration — shared between set and clear to ensure proper cleanup.
 * SameSite=none requires Secure=true (HTTPS), which is enforced in production.
 */
function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
}

/**
 * POST /api/auth/google
 * Verifies a Google OAuth credential and issues an HttpOnly JWT cookie.
 */
authRouter.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid Google credential.' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      logger.error('GOOGLE_CLIENT_ID is not configured — Google auth cannot proceed.');
      return res.status(503).json({ error: 'Authentication service is not configured.' });
    }

    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET is not configured — cannot issue token.');
      return res.status(503).json({ error: 'Authentication service is not configured.' });
    }

    // Verify the Google JWT
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      // Log internally but don't expose Google's error message to clients
      logger.warn(`Google token verification failed: ${verifyErr.message}`);
      return res.status(401).json({ error: 'Invalid or expired Google credential.' });
    }

    const { sub: googleId, email, name, picture: avatar } = payload;

    if (!googleId || !email) {
      return res.status(400).json({ error: 'Google account is missing required fields.' });
    }

    // Stateless User Profile
    const userProfile = {
      id: googleId,
      name,
      email,
      avatar,
    };
    logger.info(`Stateless user authenticated: ${email}`);

    // Generate app JWT containing the entire profile
    const token = jwt.sign(
      { user: userProfile },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HttpOnly cookie
    res.cookie('repolens_auth', token, getCookieOptions());

    res.json({
      user: userProfile,
    });
  } catch (error) {
    // Generic catch — log internally without passing raw error to client
    logger.error('Unexpected Google auth error:', error);
    const safeError = new Error('Authentication failed. Please try again.');
    safeError.statusCode = 500;
    next(safeError);
  }
});

/**
 * POST /api/auth/logout
 * Clears the authentication cookie with matching options.
 */
authRouter.post('/logout', (req, res) => {
  const opts = getCookieOptions();
  // clearCookie requires the same path/domain options used when setting
  res.clearCookie('repolens_auth', {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
  });
  res.json({ success: true });
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({
    user: req.user,
  });
});
