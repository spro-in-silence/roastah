# Roastah - Etsy-style Multi-vendor Coffee Marketplace
# Multi-stage Docker build for production deployment

# Stage 1: Base Node.js image with all dependencies
FROM --platform=linux/amd64 node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm (if using monorepo with turbo)
RUN npm install -g pnpm

# Stage 2: Dependencies installation
FROM base AS deps

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Stage 3: Frontend build
FROM base AS frontend-builder

# Copy source code
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build frontend
RUN pnpm run build:frontend

# Stage 4: Backend build
FROM base AS backend-builder

# Copy source code
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build backend
RUN pnpm run build:backend

# Stage 5: Production runtime
FROM --platform=linux/amd64 node:18-alpine AS production

# Install production dependencies only
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S roastah -u 1001

# Set working directory
WORKDIR /app

# Copy package files for production dependencies
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install only production dependencies and prune any dev dependencies
RUN npm install -g pnpm && \
    pnpm install --prod --frozen-lockfile && \
    pnpm prune --prod && \
    pnpm store prune

# Copy built applications
COPY --from=frontend-builder --chown=roastah:nodejs /app/dist ./dist
COPY --from=backend-builder --chown=roastah:nodejs /app/dist ./dist-server

# Copy necessary files
COPY --chown=roastah:nodejs docker-entrypoint.sh ./
COPY --chown=roastah:nodejs drizzle.config.ts ./
COPY --chown=roastah:nodejs migrations ./migrations

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Switch to non-root user
USER roastah

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist-server/index.js"] 