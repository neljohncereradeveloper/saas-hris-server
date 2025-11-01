# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN yarn build

# Production stage
FROM node:20-alpine

# Create app directory and non-root user
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY package.json yarn.lock ./

# Install production dependencies only
RUN yarn install --production --frozen-lockfile && \
    yarn cache clean

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy images directory for static file serving (from builder stage)
# Note: Ensure images directory exists in your repo (even if empty)
COPY --from=builder --chown=nestjs:nodejs /app/images ./images

# Change ownership of app directory
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/docs', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["yarn", "start:prod"]
