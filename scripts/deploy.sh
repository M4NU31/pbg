#!/bin/bash
# Run on VPS to deploy/update the app
# Usage: bash /var/www/pbg/scripts/deploy.sh

set -e

APP_DIR="/var/www/pbg"
cd ${APP_DIR}

echo "=== Pulling latest code ==="
git pull origin main

echo "=== Installing dependencies ==="
npm ci

echo "=== Building embed script ==="
npm run build:embed

echo "=== Building Next.js ==="
cd apps/web
npx prisma generate
npx prisma migrate deploy
npx next build

echo "=== Restarting app ==="
cd ${APP_DIR}
pm2 restart punchbug || pm2 start ecosystem.config.js
pm2 save

echo "=== Done! ==="
pm2 status
