/**
 * Backend Logger Utility
 * Provides structured logging. Verbose in development, minimal in production.
 */

const isProd = process.env.NODE_ENV === "production";

export const logger = {
  info: (message, ...args) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      // Avoid logging full error stack in production unless necessary
      if (!isProd) {
        console.error(error);
      } else {
        console.error(`Reason: ${error.message}`);
      }
    }
  },
  debug: (message, ...args) => {
    if (!isProd) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
};
