import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import cookieParser from "cookie-parser";
import http from "http";

import { analyzeRouter } from "./routes/analyze.routes.js";
import { savedAnalysisRouter } from "./routes/analysis.routes.js";
import { statsRouter } from "./routes/stats.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";
import { validateEnv } from "./utils/envValidator.js";

// --------------- Validate Environment (Fail Fast) ---------------
validateEnv(logger);

const app = express();
const PORT = process.env.PORT || 8080;

// --------------- Trust Proxy (Render, Railway, AWS ALB, Nginx, Cloudflare) ---------------
// Required for correct req.ip, rate limiting, and secure cookies behind any reverse proxy.
app.set("trust proxy", 1);

// --------------- Security Middleware ---------------
app.use(
  helmet({
    hsts: false,
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    originAgentCluster: false,
  })
);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL || false
        : ["http://localhost:5173", "http://localhost:8080"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// --------------- Compression ---------------
// Compresses all non-SSE responses (JSON, HTML, static assets).
// SSE responses are excluded automatically because they use chunked transfer encoding
// and set res.flushHeaders() before any data is written.
app.use(
  compression({
    // Only compress responses larger than 1KB (default is 1KB — explicit for clarity)
    threshold: 1024,
    // Skip compression for SSE streams
    filter: (req, res) => {
      if (res.getHeader("Content-Type")?.includes("text/event-stream")) return false;
      return compression.filter(req, res);
    },
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// --------------- Rate Limiting ---------------
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many requests. Please try again in a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many authentication attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

app.use("/api/analyze", analyzeLimiter);
app.use("/api/auth", authLimiter);

// --------------- Request Logging ---------------
if (process.env.NODE_ENV !== "test") {
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path} - IP: ${req.ip}`);
    next();
  });
}

// --------------- API Routes ---------------
app.use("/api/auth", authRouter);
app.use("/api/saved-analyses", savedAnalysisRouter);
app.use("/api/stats", statsRouter);
app.use("/api", analyzeRouter);

// --------------- Health Endpoints ---------------
// GET /api/health — lightweight liveness probe (load balancers, Docker, Kubernetes)
// Returns 200 immediately.
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    env: process.env.NODE_ENV || "development",
    uptime: Math.floor(process.uptime()),
  });
});

// GET /api/ready — readiness probe (Kubernetes, AWS ALB, Render)
// Returns 200 since the app is stateless.
app.get("/api/ready", (_req, res) => {
  res.json({
    status: "ready",
    db: "removed",
    message: "Stateless API is ready",
  });
});

// --------------- Serve Frontend (Production) ---------------
const frontendBuildPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendBuildPath, {
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith("index.html")) {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    } else if (filePath.includes("/assets/") || filePath.includes("\\assets\\")) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  }
}));

app.get("*", (_req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

// --------------- Error Handler (must be last) ---------------
app.use(errorHandler);

// --------------- Create HTTP Server ---------------
const server = http.createServer(app);

// --------------- Server Timeouts ---------------
server.keepAliveTimeout = 65_000; // 65 seconds
server.headersTimeout = 70_000; // 70 seconds
server.requestTimeout = 120_000; // 120 seconds

// --------------- Active SSE Connection Tracking ---------------
const activeSseConnections = new Set();

export function registerSseConnection(res) {
  activeSseConnections.add(res);
  res.on("close", () => activeSseConnections.delete(res));
}

export function closeSseConnections() {
  if (activeSseConnections.size > 0) {
    logger.info(`Closing ${activeSseConnections.size} active SSE connection(s)...`);
    for (const res of activeSseConnections) {
      try {
        res.write("data: [SHUTDOWN]\n\n");
        res.end();
      } catch {
        // Connection may already be closed
      }
    }
    activeSseConnections.clear();
  }
}

// --------------- Start Server ---------------
server.listen(PORT, () => {
  logger.info(`🔭 RepoLens AI server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(
    `GitHub Token: ${process.env.GITHUB_TOKEN ? "✅ Configured (5000 req/hr)" : "⚠️  Not set (60 req/hr limit)"}`
  );
});

// --------------- Graceful Shutdown ---------------
let isShuttingDown = false;

function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Received ${signal}. Shutting down gracefully...`);

  // 1. Drain active SSE streams (notify clients)
  closeSseConnections();

  // 2. Stop accepting new HTTP connections
  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });

  // 4. Force shutdown if graceful close takes too long
  setTimeout(() => {
    logger.error("Could not close connections in time — forcefully shutting down.");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason instanceof Error ? reason : new Error(String(reason)));
});
