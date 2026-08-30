# ============================================
# RepoLens AI - Multi-stage Docker Build
# ============================================

# Stage 1: Build Frontend
FROM node:20-alpine AS build-frontend
WORKDIR /app/frontend

# Install dependencies first (layer cache optimization)
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

# Copy source and build
COPY frontend/ .
RUN npm run build

# ============================================
# Stage 2: Production Server
# ============================================
FROM node:20-alpine AS production

# Create non-root user for security before any WORKDIR commands
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install backend production dependencies
COPY backend/package.json backend/package-lock.json* ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev && npm cache clean --force

# Copy backend source files
COPY backend/ .

# Copy built frontend assets from stage 1
WORKDIR /app
COPY --from=build-frontend /app/frontend/dist ./frontend/dist

# Set correct ownership before switching users
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Environment
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Health check — verifies the server is responsive before routing traffic
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# Use exec form for correct signal handling (SIGTERM reaches Node process directly)
WORKDIR /app/backend
CMD ["node", "server.js"]
