#!/bin/bash
set -e

DEPLOY_DIR="/var/www/kvltech"
STANDALONE="$DEPLOY_DIR/.next/standalone"

cd "$DEPLOY_DIR"

git pull

npm run build
npx prisma generate

# Standalone mode requires these to be copied manually after every build
rm -rf "$STANDALONE/.next/static" "$STANDALONE/public"
cp -r "$DEPLOY_DIR/.next/static" "$STANDALONE/.next/static"
cp -r "$DEPLOY_DIR/public" "$STANDALONE/public"

pm2 restart kvltech
