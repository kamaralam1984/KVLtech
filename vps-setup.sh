#!/bin/bash
set -e

echo "=== KVL TECH VPS Setup Script ==="
echo "Checking existing services..."

# Check what's running on ports 80 and 443
echo ""
echo "--- Ports currently in use ---"
ss -tlnp | grep -E ':80|:443|:3000' || echo "No services on these ports"

echo ""
echo "--- Running web services ---"
systemctl is-active nginx 2>/dev/null && echo "nginx: RUNNING" || echo "nginx: not running"
systemctl is-active apache2 2>/dev/null && echo "apache2: RUNNING" || echo "apache2: not running"
docker ps 2>/dev/null | head -20 || echo "docker: not installed"

# Install Docker if not present
if ! command -v docker &>/dev/null; then
  echo ""
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
else
  echo "Docker already installed: $(docker --version)"
fi

# Create deployment directory
mkdir -p /opt/kvl-tech
cd /opt/kvl-tech

# Add deploy SSH public key
DEPLOY_PUBKEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJM+8HPIaE7io1O5bLdrvZfwGg9+yMmroSXzFhV4hxxR kvltech-github-deploy"
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
if ! grep -q "kvltech-github-deploy" ~/.ssh/authorized_keys; then
  echo "$DEPLOY_PUBKEY" >> ~/.ssh/authorized_keys
  echo "Deploy SSH key added."
else
  echo "Deploy SSH key already present."
fi
chmod 600 ~/.ssh/authorized_keys

# Download docker-compose.vps.yml from GitHub
echo ""
echo "Downloading deployment files..."
curl -fsSL "https://raw.githubusercontent.com/kamaralam1984/KVLtech/main/docker-compose.vps.yml" -o docker-compose.vps.yml

# Create .env.production if not exists
if [ ! -f .env.production ]; then
  cat > .env.production << 'ENVEOF'
DATABASE_URL="postgresql://kvluser:kvltech2024@db:5432/kvltech?schema=public"
JWT_SECRET="kvltech-super-secret-jwt-key-2024-CHANGE-ME"
NEXTAUTH_SECRET="kvltech-nextauth-secret-2024-CHANGE-ME"
NEXT_PUBLIC_SITE_URL="https://kvlbusinesssolutions.com"
SITE_URL="https://kvlbusinesssolutions.com"
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED="1"
EMAIL_USER=kvlbusinesssolutions@gmail.com
EMAIL_PASS=FILL_IN
EMAIL_FROM="KVL TECH <kvlbusinesssolutions@gmail.com>"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=8rupiya@gmail.com
SMTP_PASS=FILL_IN
GROQ_API_KEY=FILL_IN
DEEPGRAM_API_KEY=FILL_IN
ASSEMBLYAI_API_KEY=FILL_IN
OPENAI_API_KEY=FILL_IN
OPENROUTER_API_KEY=FILL_IN
RESEND_API_KEY=FILL_IN
SERPAPI_KEY=FILL_IN
ENVEOF
  echo ""
  echo "IMPORTANT: Edit /opt/kvl-tech/.env.production and fill in FILL_IN values"
  echo "  nano /opt/kvl-tech/.env.production"
  echo ".env.production created."
else
  echo ".env.production already exists, skipping."
fi

# Setup nginx site config (if nginx is running on host)
if systemctl is-active --quiet nginx; then
  echo ""
  echo "Setting up nginx site config..."
  curl -fsSL "https://raw.githubusercontent.com/kamaralam1984/KVLtech/main/nginx-kvltech.conf" \
    -o /etc/nginx/sites-available/kvlbusinesssolutions.com

  # Enable site
  ln -sf /etc/nginx/sites-available/kvlbusinesssolutions.com \
         /etc/nginx/sites-enabled/kvlbusinesssolutions.com

  # Test nginx config
  nginx -t && echo "Nginx config OK"
  echo ""
  echo "IMPORTANT: Run these to get SSL certificate:"
  echo "  apt install -y certbot python3-certbot-nginx"
  echo "  certbot --nginx -d kvlbusinesssolutions.com -d www.kvlbusinesssolutions.com"
fi

# Login to GitHub Container Registry (public image, no auth needed for pull)
echo ""
echo "Pulling Docker image..."
docker compose -f docker-compose.vps.yml pull || echo "Image not built yet - will be ready after first GitHub Actions run"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "NEXT STEPS:"
echo "1. Verify nginx SSL is configured:"
echo "   certbot --nginx -d kvlbusinesssolutions.com -d www.kvlbusinesssolutions.com"
echo ""
echo "2. Open port 22 in Hostinger firewall (for GitHub Actions to SSH in)"
echo "   Hostinger Panel → Firewall → Add rule: TCP port 22, Source: 0.0.0.0/0"
echo ""
echo "3. GitHub Actions will auto-deploy on every push to main branch"
echo "   Watch: https://github.com/kamaralam1984/KVLtech/actions"
echo ""
echo "To manually start the app now:"
echo "  cd /opt/kvl-tech && docker compose -f docker-compose.vps.yml up -d"
