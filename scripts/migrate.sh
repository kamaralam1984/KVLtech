#!/bin/bash
set -e

echo "Running database migrations..."
npx prisma migrate deploy
echo "Migrations complete"

echo "Generating Prisma client..."
npx prisma generate
echo "Done"
