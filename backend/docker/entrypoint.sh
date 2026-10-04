#!/bin/sh
set -eu

echo "[entrypoint] applying database migrations"
pnpm exec prisma migrate deploy

echo "[entrypoint] starting CSMJU Interactive Map API"
exec "$@"
