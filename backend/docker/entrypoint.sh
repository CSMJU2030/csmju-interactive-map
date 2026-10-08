#!/bin/sh
set -eu

echo "[entrypoint] applying database migrations"
node node_modules/prisma/build/index.js migrate deploy

echo "[entrypoint] starting CSMJU Interactive Map API"
exec "$@"
