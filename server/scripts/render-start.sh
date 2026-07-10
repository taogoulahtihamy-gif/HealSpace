#!/bin/sh
set -eu

echo "HealSpace Render start"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is missing"
  exit 1
fi

if [ -z "${JWT_SECRET:-}" ]; then
  echo "JWT_SECRET is missing"
  exit 1
fi

echo "Generating Prisma Client..."
npx prisma generate

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Starting HealSpace API..."
npm run start
