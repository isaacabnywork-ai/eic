#!/usr/bin/env bash
set -e

# ==============================================================================
# Equip Indian Churches - Automated VPS Deployment Script
# ==============================================================================

echo "========================================="
echo " Starting Deploy for equipindianchurches.com"
echo "========================================="

# 1. Pull latest code from main
echo "[1/4] Pulling latest git commits..."
git fetch origin main
git reset --hard origin/main

# 2. Install dependencies cleanly
echo "[2/4] Installing dependencies..."
npm ci

# 3. Build production bundle (TypeScript check + Vite build + Sitemap generation)
echo "[3/4] Building production bundle..."
npm run build

# 4. Verify dist directory exists and reload PM2 / Nginx
echo "[4/4] Verifying build output and reloading services..."
if [ -d "dist" ]; then
    echo "✓ Build successful! dist/ is ready."

    # Reload PM2 if running
    if command -v pm2 &> /dev/null; then
        pm2 reload ecosystem.config.cjs || pm2 start ecosystem.config.cjs
        echo "✓ PM2 process reloaded."
    fi

    # Reload Nginx if active
    if command -v systemctl &> /dev/null && systemctl is-active --quiet nginx; then
        sudo systemctl reload nginx
        echo "✓ Nginx reloaded successfully."
    fi
else
    echo "❌ Error: dist/ directory was not found after build!"
    exit 1
fi

echo "========================================="
echo " Deployment Complete!"
echo " Web app is live at: https://equipindianchurches.com"
echo " Backend REST API:  https://admin.equipindianchurches.com"
echo "========================================="
