# Saiyfon SaaS Console (admin)

Nuxt 4 SPA ສຳລັບ platform admin: ຈັດການ tenant, domain, plan ແລະ audit log.

## Stack

- Nuxt 4.6 (`ssr: false`), Vue 3, Tailwind CSS 4
- Auth: platform JWT (`aud=platform`) ເກັບໃນ cookie `saiyfon_platform_token`
- API: `/api/platform/*` ຂອງ `server/`

## Dev

```bash
cd admin
npm install
cp .env.example .env      # ຖ້າຍັງບໍ່ມີ
npm run dev -- --port 3001
```

`.env` ສຳລັບ dev ທີ່ຕໍ່ server ທ້ອງຖິ່ນ:

```bash
NUXT_PUBLIC_API_BASE=http://localhost:5055/api
NUXT_PUBLIC_ROOT_DOMAIN=saiyfon.app
```

ເຂົ້າສູ່ລະບົບດ້ວຍ `PLATFORM_ADMIN_EMAIL` / `PLATFORM_ADMIN_PASSWORD` ຈາກ `server/.env`.

## Pages

| Path | ໜ້າທີ່ |
|---|---|
| `/login` | platform login |
| `/tenants` | list/search/create tenant, ສະແດງ DNS ຫຼັງສ້າງ |
| `/tenants/:id` | settings/branding, domains + verify, usage, impersonate, suspend/delete |
| `/plans` | ສ້າງ plan, ເປີດ/ປິດ |
| `/audit` | audit log + filter |

## Serve ຈາກ Server (same-origin)

`server/` ສາມາດ serve admin build ໄດ້ເລີຍ (default ຈະຫາ `../admin/.output/public`):

```bash
cd admin
NUXT_PUBLIC_API_BASE=/api NUXT_PUBLIC_ROOT_DOMAIN=saiyfon.app npm run generate
cd ../server
npm run dev
# ເປີດ http://localhost:5055  → admin UI
```

Production: ໃຊ້ root `Dockerfile` (build ທັງ server + admin, `ADMIN_DIST_PATH=/app/admin`) — ເບິ່ງ `server/README.md`.

## Build / Deploy ແຍກ (static)

Admin ເປັນ static SPA. ໃຊ້ Dockerfile ທີ່ `admin/Dockerfile` (build ດ້ວຍ Nuxt generate, serve ດ້ວຍ Nginx).

```bash
npm run generate          # ອອກ .output/public
docker build -t saiyfon-admin \
  --build-arg NUXT_PUBLIC_API_BASE=/api \
  --build-arg NUXT_PUBLIC_ROOT_DOMAIN=saiyfon.app .
```

Coolify:

1. Resource → Dockerfile, Base Directory `admin`, Port `80`.
2. Healthcheck `/health`.
3. Domain: `admin.saiyfon.app`.
4. ແນະນຳໃຫ້ reverse proxy `/api` ຂອງ admin host ໄປ server ເພື່ອໃຫ້ `NUXT_PUBLIC_API_BASE=/api` ເຮັດວຽກ (same-origin, ບໍ່ຕ້ອງ CORS).
   ຫຼື build ດ້ວຍ absolute URL:
   `--build-arg NUXT_PUBLIC_API_BASE=https://api.saiyfon.app/api`.

> `NUXT_PUBLIC_*` ຖືກ bake ຕອນ build ສຳລັບ SPA — ປ່ຽນຄ່າຫຼັງ build ບໍ່ໄດ້.

## Security notes

- Console ນີ້ໃຊ້ realm `platform` ເທົ່ານັ້ນ; token tenant ໃຊ້ບໍ່ໄດ້.
- ທຸກ action ສຳຄັນຖືກບັນທຶກໃນ `platform_audit_logs`.
- ຢ່າເປີດ console ໃຫ້ public ໂດຍບໍ່ມີ MFA/rate limit ໃນ production (ແຜນ P6).
