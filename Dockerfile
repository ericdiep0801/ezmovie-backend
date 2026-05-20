# Multi-stage build for NestJS production deployment
# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application and build
COPY . .
RUN npm run build

# Stage 2: Production runtime environment
FROM node:18-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built distribution from builder stage
COPY --from=builder /app/dist ./dist

# Expose NestJS default port
EXPOSE 3000

# Cap V8 heap (~450MB) để tránh process bị OS kill trước khi GC kịp hoạt động trên 512MB instance
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=450"

# Start production server
CMD ["node", "dist/main"]
