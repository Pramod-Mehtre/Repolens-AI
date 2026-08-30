/**
 * Environment Variable Validator
 * Validates all required environment variables on startup.
 * Fails fast with a clear error message if any are missing.
 * Call this BEFORE initializing any services.
 */

const REQUIRED_VARS = [
  {
    key: 'GROQ_API_KEY',
    description: 'Groq API key for AI analysis (get one at https://console.groq.com/keys)',
  },
];

const RECOMMENDED_VARS = [
  {
    key: 'JWT_SECRET',
    description: 'Secret key for signing JWT tokens (required for auth features)',
  },
  {
    key: 'FRONTEND_URL',
    description: 'Frontend URL for CORS in production (e.g. https://your-app.com)',
  },
];

/**
 * Validates environment variables and exits if any required vars are missing.
 * Warns about recommended vars that are missing but does not exit.
 * @param {import('../utils/logger.js').logger} logger
 */
export function validateEnv(logger) {
  const missing = [];

  for (const { key, description } of REQUIRED_VARS) {
    const value = process.env[key];
    if (!value || !value.trim()) {
      missing.push({ key, description });
    }
  }

  if (missing.length > 0) {
    logger.error('════════════════════════════════════════════════════════');
    logger.error('FATAL: Missing required environment variables:');
    for (const { key, description } of missing) {
      logger.error(`  ❌ ${key} — ${description}`);
    }
    logger.error('');
    logger.error('Set these variables in your .env file and restart.');
    logger.error('See .env.example for documentation on all variables.');
    logger.error('════════════════════════════════════════════════════════');
    process.exit(1);
  }

  // Warn about recommended missing vars
  for (const { key, description } of RECOMMENDED_VARS) {
    const value = process.env[key];
    if (!value || !value.trim()) {
      logger.warn(`  ⚠️  ${key} not set — ${description}`);
    }
  }

  // Security: warn if JWT_SECRET is using a weak default
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    logger.warn('JWT_SECRET is shorter than 32 characters — use a longer, random secret in production.');
  }
}
