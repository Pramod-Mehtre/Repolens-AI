import express from 'express';

export const statsRouter = express.Router();

/**
 * GET /api/stats
 * Returns aggregated usage statistics.
 * Auth features are currently disabled — returns zeroed stats.
 */
statsRouter.get('/', (req, res) => {
  // Auth is currently disabled. Return safe default values.
  res.json({ totalAnalyses: 0, avgHealthScore: 0, favoriteLanguage: 'None' });
});
