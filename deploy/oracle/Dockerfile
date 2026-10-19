# Build on linux/arm64 (Oracle Ampere A1); build context is repository root.
FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile && pnpm build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
RUN corepack enable
COPY --from=build /app /app
ENV NODE_ENV=staging
USER node

FROM runtime AS api
CMD ["node", "apps/api/dist/index.js"]

FROM runtime AS worker
CMD ["node", "apps/worker/dist/index.js"]

FROM caddy:2-alpine AS web
COPY --from=build /app/apps/web/dist /srv
COPY deploy/oracle/Caddyfile /etc/caddy/Caddyfile
