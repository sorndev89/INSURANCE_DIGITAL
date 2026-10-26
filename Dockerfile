# syntax=docker/dockerfile:1

FROM node:24-alpine AS server-deps
WORKDIR /server
COPY server/package.json server/package-lock.json ./
RUN npm ci

FROM server-deps AS server-build
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine AS admin-deps
WORKDIR /admin
COPY admin/package.json admin/package-lock.json ./
RUN npm ci

FROM admin-deps AS admin-build
COPY admin/ ./
ARG NUXT_PUBLIC_API_BASE=/api
ARG NUXT_PUBLIC_ROOT_DOMAIN=saiyfon.app
ENV NUXT_PUBLIC_API_BASE=${NUXT_PUBLIC_API_BASE}
ENV NUXT_PUBLIC_ROOT_DOMAIN=${NUXT_PUBLIC_ROOT_DOMAIN}
RUN npm run generate

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV ADMIN_DIST_PATH=/app/admin
RUN apk add --no-cache curl \
  && addgroup -S app \
  && adduser -S app -G app
COPY --from=server-build /server/node_modules ./node_modules
COPY --from=server-build /server/dist ./dist
COPY server/drizzle ./drizzle
COPY server/package.json ./
COPY --from=admin-build /admin/.output/public ./admin
USER app
EXPOSE 5055
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:5055/health || exit 1
CMD ["node", "dist/index.js"]
