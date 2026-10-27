# ==============================================================================
# Multi-stage Dockerfile for Equip Indian Churches Web App
# ==============================================================================

# Stage 1: Build the React Application
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for efficient layer caching
COPY package*.json ./
RUN npm ci

# Copy source code and build config
COPY . .

# Build production bundle with sitemap
ENV NODE_ENV=production
ENV VITE_WP_URL=https://admin.equipindianchurches.com
ENV VITE_SITE_URL=https://equipindianchurches.com
RUN npm run build

# Stage 2: Serve using high-performance Nginx Alpine
FROM nginx:alpine

# Copy custom Nginx configuration
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location ~* \.(?:ico|css|js|gif|jpe?g|png|webp|svg|woff2?|xml)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
