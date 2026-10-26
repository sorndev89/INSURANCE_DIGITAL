# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm ci --include=dev
ENV NODE_ENV=production
COPY . .

# NUXT_PUBLIC_* values are baked into the SPA at build time.
ARG NUXT_PUBLIC_API_BASE=https://admin.saiyfon.app/api
ARG NUXT_PUBLIC_PLATFORM_URL=https://admin.saiyfon.app
ARG NUXT_PUBLIC_USE_MOCK=false
ARG NUXT_PUBLIC_TENANT_MODE=auto
ARG NUXT_PUBLIC_DEFAULT_TENANT_SLUG=saiyfon
ARG NUXT_PUBLIC_DEFAULT_TENANT_NAME=ສາຍຝົນ ປະກັນໄພ
ARG NUXT_PUBLIC_DEFAULT_BRAND_COLOR=#047857

ENV NUXT_TELEMETRY_DISABLED=1 \
    NUXT_PUBLIC_API_BASE=${NUXT_PUBLIC_API_BASE} \
    NUXT_PUBLIC_PLATFORM_URL=${NUXT_PUBLIC_PLATFORM_URL} \
    NUXT_PUBLIC_USE_MOCK=${NUXT_PUBLIC_USE_MOCK} \
    NUXT_PUBLIC_TENANT_MODE=${NUXT_PUBLIC_TENANT_MODE} \
    NUXT_PUBLIC_DEFAULT_TENANT_SLUG=${NUXT_PUBLIC_DEFAULT_TENANT_SLUG} \
    NUXT_PUBLIC_DEFAULT_TENANT_NAME=${NUXT_PUBLIC_DEFAULT_TENANT_NAME} \
    NUXT_PUBLIC_DEFAULT_BRAND_COLOR=${NUXT_PUBLIC_DEFAULT_BRAND_COLOR}

RUN npm run generate

FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/.output/public /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/health || exit 1
