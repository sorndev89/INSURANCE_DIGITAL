# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG NUXT_PUBLIC_API_BASE=/api
ARG NUXT_PUBLIC_ROOT_DOMAIN=saiyfon.app
ENV NODE_ENV=production
ENV NUXT_PUBLIC_API_BASE=${NUXT_PUBLIC_API_BASE}
ENV NUXT_PUBLIC_ROOT_DOMAIN=${NUXT_PUBLIC_ROOT_DOMAIN}
RUN npm run generate

FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/.output/public /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/health || exit 1
