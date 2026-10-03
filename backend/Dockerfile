FROM node:22-alpine AS builder

WORKDIR /app
RUN corepack enable
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build_only

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
RUN pnpm install --frozen-lockfile --filter @csmju-interactive-map/backend...

COPY backend backend
RUN pnpm --filter @csmju-interactive-map/backend prisma:generate \
  && pnpm --filter @csmju-interactive-map/backend build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
RUN pnpm install --frozen-lockfile --prod --filter @csmju-interactive-map/backend... --ignore-scripts

COPY --from=builder /app/backend/dist backend/dist
COPY backend/prisma backend/prisma
COPY backend/prisma.config.ts backend/prisma.config.ts
COPY backend/docker/entrypoint.sh backend/docker/entrypoint.sh

RUN DATABASE_URL=postgresql://localhost:5432/build_only pnpm --filter @csmju-interactive-map/backend prisma:generate

RUN chmod +x backend/docker/entrypoint.sh && chown -R node:node /app
USER node
WORKDIR /app/backend

EXPOSE 4202
ENTRYPOINT ["./docker/entrypoint.sh"]
CMD ["node", "dist/main.js"]
