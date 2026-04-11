#!/bin/bash
# Run this ONCE on a fresh Ubuntu 22.04/24.04 VPS (DigitalOcean Droplet)
# Usage: bash vps-setup.sh [domain]
# Example (IP only):  bash vps-setup.sh
# Example (domain):   bash vps-setup.sh punchteam.com

set -e

APP_DIR="/var/www/pbg"
DOMAIN="${1:-}"   # optional — pass as first argument when you have a domain
DB_NAME="punchbug"
DB_USER="punchbug"
DB_PASS="$(openssl rand -base64 24)"

echo "=== Installing Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "=== Installing PM2 ==="
npm install -g pm2

echo "=== Installing Nginx ==="
apt-get install -y nginx

echo "=== Installing MySQL ==="
apt-get install -y mysql-server
mysql_secure_installation

echo "=== Creating database and user ==="
mysql -u root <<SQL
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

echo ""
echo "=== DATABASE CREDENTIALS (save these!) ==="
echo "DB_NAME: ${DB_NAME}"
echo "DB_USER: ${DB_USER}"
echo "DB_PASS: ${DB_PASS}"
echo "DATABASE_URL: mysql://${DB_USER}:${DB_PASS}@localhost:3306/${DB_NAME}"
echo ""

echo "=== Cloning repository ==="
mkdir -p ${APP_DIR}
cd ${APP_DIR}
git clone https://github.com/M4NU31/pbg.git .

echo "=== Setting up Nginx ==="
if [ -n "${DOMAIN}" ]; then
  SERVER_NAME="${DOMAIN} www.${DOMAIN}"
else
  SERVER_NAME="_"
fi

cat > /etc/nginx/sites-available/pbg <<NGINX
server {
    listen 80;
    server_name ${SERVER_NAME};

    # Serve uploaded files directly
    location /uploads/ {
        alias ${APP_DIR}/apps/web/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        client_max_body_size 15M;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/pbg /etc/nginx/sites-enabled/pbg
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

if [ -n "${DOMAIN}" ]; then
  echo "=== Installing Certbot (SSL) ==="
  apt-get install -y certbot python3-certbot-nginx
  certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m admin@${DOMAIN}
else
  echo "=== Skipping SSL (no domain provided — add one later with certbot) ==="
fi

echo ""
echo "=== NEXT STEPS ==="
echo "1. Create /var/www/pbg/apps/web/.env.local with your secrets"
echo "   (see .env.example for required variables)"
echo "2. Run: cd /var/www/pbg && npm ci"
echo "3. Apply database schema:"
echo "   mysql -u ${DB_USER} -p'${DB_PASS}' ${DB_NAME} < scripts/create-tables.sql"
echo "   for f in scripts/migrate-v*.sql; do mysql -u ${DB_USER} -p'${DB_PASS}' ${DB_NAME} < \"\$f\"; done"
echo "4. Run: npm run build"
echo "5. Run: pm2 start ecosystem.config.js"
echo "6. Run: pm2 save && pm2 startup"
if [ -z "${DOMAIN}" ]; then
  echo ""
  echo "NOTE: Running on IP only (no SSL). When you have a domain, run:"
  echo "  certbot --nginx -d yourdomain.com -d www.yourdomain.com --non-interactive --agree-tos -m admin@yourdomain.com"
  echo "  Then update NEXTAUTH_URL and NEXT_PUBLIC_APP_URL in .env.local"
fi
