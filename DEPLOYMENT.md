# KVL TECH Website — Deployment Guide

## Quick Start (Docker)

1. Clone and configure:
   ```bash
   git clone https://github.com/yourrepo/kvl-tech-website
   cp .env.example .env.production
   # Edit .env.production with real values
   ```

2. Start services:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

3. Run migrations:
   ```bash
   docker compose exec app npx prisma migrate deploy
   ```

4. Create admin user:
   ```bash
   ADMIN_EMAIL=admin@kvlbusinesssolutions.com ADMIN_PASSWORD=yourpassword \
   docker compose exec app node -e "$(cat scripts/seed-admin.ts)"
   ```

## Environment Variables
See `.env.example` for all required variables.

## Health Check
```bash
curl https://kvlbusinesssolutions.com/api/health
```

## Metrics (Prometheus)
```bash
curl -H "Authorization: Bearer $METRICS_TOKEN" https://kvlbusinesssolutions.com/api/metrics
```

## Updating
```bash
docker compose pull && docker compose up -d --remove-orphans
```
