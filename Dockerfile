# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Accept build arguments
ARG VITE_API_URL
ARG VITE_LANDING_URL
ARG VITE_APP_URL

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_LANDING_URL=$VITE_LANDING_URL
ENV VITE_APP_URL=$VITE_APP_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:1.26-alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
