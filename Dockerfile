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

# Set environment variable
ENV NODE_ENV=production

# Start production server
CMD ["node", "dist/main"]
