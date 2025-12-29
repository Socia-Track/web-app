# Multi-stage build for React + Vite frontend
FROM node:22.13.0-alpine3.21 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application
# Environment variables will be set during build via Cloud Build
ARG VITE_API_URL
ARG VITE_FRONTEND_URL
ARG VITE_BUILD_TYPE
ARG VITE_APP_URL
ARG VITE_LANDING_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL
ENV VITE_BUILD_TYPE=$VITE_BUILD_TYPE
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_LANDING_URL=$VITE_LANDING_URL

RUN npm run build

# Production stage with nginx
FROM nginx:1.26-alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nginx-group && \
    adduser -S nginx-user -u 1001 && \
    chown -R nginx-user:nginx-group /usr/share/nginx/html && \
    chown -R nginx-user:nginx-group /var/cache/nginx && \
    chown -R nginx-user:nginx-group /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-group /var/run/nginx.pid

USER nginx-user

# Expose port (Cloud Run uses PORT env variable, default to 8080)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
