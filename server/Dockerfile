# syntax=docker/dockerfile:1

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
COPY drizzle ./drizzle
RUN npm run db:check:static && npm run build && npm prune --omit=dev

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl \
  && addgroup -S app \
  && adduser -S app -G app \
  && mkdir -p /app/uploads \
  && chown -R app:app /app/uploads
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY drizzle ./drizzle
COPY package.json ./
USER app
EXPOSE 5055
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:5055/health || exit 1
CMD ["node", "dist/index.js"]
