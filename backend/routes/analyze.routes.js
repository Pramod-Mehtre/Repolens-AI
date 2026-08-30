/**
 * Analysis Route
 * POST /api/analyze — Accepts a GitHub URL, fetches repo data, streams AI analysis via SSE.
 * Provides differentiated error messages for each failure type.
 */

import { Router } from "express";
import { parseGitHubUrl } from "../utils/validators.js";
import { fetchRepoData } from "../services/github.service.js";
import { streamAnalysis } from "../services/ai.service.js";
import { detectTechStack, parseDependencies, runSecurityScan } from "../services/analyzer.service.js";
import { logger } from "../utils/logger.js";
import { registerSseConnection } from "../server.js";

export const analyzeRouter = Router();

/**
 * Map error types to user-friendly messages with appropriate status codes.
 */
function mapError(err) {
  const type = err.errorType || "UNKNOWN";
  const defaults = {
    NOT_FOUND: {
      status: 404,
      message: "Repository not found. Make sure it exists and is public.",
    },
    FORBIDDEN: {
      status: 403,
      message: "Access denied. The repository may be private or restricted.",
    },
    RATE_LIMIT: {
      status: 429,
      message: err.message || "GitHub API rate limit exceeded. Try again later.",
    },
    REPO_TOO_LARGE: {
      status: 422,
      message: err.message || "Repository is too large to analyze.",
    },
    AI_UNAVAILABLE: {
      status: 503,
      message: err.message || "AI service is currently unavailable. Try again later.",
    },
    AI_AUTH_ERROR: {
      status: 503,
      message: "AI service authentication failed. The server admin needs to check the API key.",
    },
    AI_RATE_LIMIT: {
      status: 429,
      message: "AI service rate limit reached. Please wait a moment and try again.",
    },
    GITHUB_ERROR: {
      status: 502,
      message: "Failed to communicate with GitHub.",
    },
  };

  return (
    defaults[type] || {
      status: err.statusCode || 500,
      // In production, don't leak internal error messages for unexpected errors
      message:
        process.env.NODE_ENV === "production" && !err.errorType
          ? "An unexpected error occurred. Please try again."
          : err.message || "An unexpected error occurred.",
    }
  );
}

analyzeRouter.post("/analyze", async (req, res, next) => {
  try {
    const { url } = req.body;

    // 1. Validate the GitHub URL
    const parsed = parseGitHubUrl(url);
    if (!parsed.valid) {
      return res.status(400).json({
        error: parsed.error,
        errorType: "INVALID_URL",
      });
    }

    const { owner, repo } = parsed;
    logger.info(`Analysis requested: ${owner}/${repo}`);

    // 2. Fetch repository data from GitHub API
    let repoData;
    try {
      repoData = await fetchRepoData(owner, repo);
    } catch (err) {
      const mapped = mapError(err);
      logger.warn(`GitHub fetch failed for ${owner}/${repo}: ${err.message}`);
      return res.status(mapped.status).json({
        error: mapped.message,
        errorType: err.errorType || "GITHUB_ERROR",
      });
    }

    // 3. Run programmatic analysis
    // Note: repoData.metadata does not have dependencies — we parse them from configFiles
    const techStack = detectTechStack(
      {},
      {},
      repoData.treeRaw || []
    );
    const dependencies = parseDependencies(repoData.configFiles || []);
    const security = runSecurityScan(repoData.treeRaw || [], repoData.configFiles || []);

    // 4. Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-store");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable Nginx/Cloudflare buffering
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.flushHeaders();

    // Register this SSE response for graceful shutdown tracking
    registerSseConnection(res);

    // 5. Send initial programmatic data
    res.write(
      `data: ${JSON.stringify({
        type: "metadata",
        data: repoData.metadata,
        languages: repoData.languages,
        techStack,
        dependencies,
        security,
        tree: repoData.treeRaw,
      })}\n\n`
    );

    // 6. Stream AI analysis
    try {
      await streamAnalysis(repoData, res, req);
    } catch (err) {
      logger.error(`AI streaming error for ${owner}/${repo}: ${err.message}`);
      const mapped = mapError(err);
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error: mapped.message,
          errorType: err.errorType || "AI_UNAVAILABLE",
        })}\n\n`
      );
    }

    // 7. Signal completion
    res.write("data: [DONE]\n\n");
    res.end();

    logger.info(`Analysis complete: ${owner}/${repo}`);
  } catch (err) {
    next(err);
  }
});
