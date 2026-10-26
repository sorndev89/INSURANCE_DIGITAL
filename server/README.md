# SAIYFON Insurance API (server)

Express 5 + Drizzle ORM + MySQL + Redis. ເປັນ **control plane** (ຈັດການ tenant) ແລະ **data plane** (API ຂອງແຕ່ລະ tenant) ໃນບ່ອນດຽວ.

## 1. ໂຄງສ້າງ

```text
src/
├── app.ts                 # ປະກອບ middleware + routes (ບໍ່ listen)
├── index.ts               # bootstrap + graceful shutdown
├── config/env.ts          # ອ່ານ/validate env
├── db/{index,schema,migrate}.ts
├── middleware/            # tenantResolver, auth, platformAuth, cors
├── controllers/           # auth, users, public, tenants, plans, audit
├── repositories/          # ບັງຄັບ tenantId ໃນທຸກ query
├── services/              # cache (Redis), tenantCache, provisioning, domains, audit
├── routes/
├── scripts/               # seed-initial (default), seed-platform/tenant/demo
└── types/context.ts       # req.tenant / req.auth / req.platformAuth
```

## 2. ຫຼັກການ Multi‑Tenant

- **Shared DB + `tenant_id`** ທຸກຕາຕະລາງທຸລະກິດ; unique ແບບ composite:
  `(tenant_id, email)`, `(tenant_id, username)`, `(tenant_id, policy_number)`, `(tenant_id, agent_code)`.
- **Tenant ຈາກ Host** (`acme.saiyfon.app`, custom domain) ຫຼື header `X-Tenant` (mobile/dev).
- **JWT 2 realm**: `aud=tenant` ແລະ `aud=platform`, ຄົນລະ secret (`JWT_SECRET`, `PLATFORM_JWT_SECRET`).
- Token ຂອງ tenant ໜຶ່ງຈະຖືກປະຕິເສດ (403) ຖ້າສົ່ງມາກັບ Host/X‑Tenant ຂອງອີກ tenant.
- ທຸກ query ຕ້ອງຜ່ານ repository ທີ່ຮັບ `tenantId` ເປັນ argument ທຳອິດ.

## 3. Dev setup (MySQL + Redis ຜ່ານ Docker)

```bash
cd server
cp .env.example .env          # ຖ້າຍັງບໍ່ມີ
docker compose -f docker-compose.dev.yml up -d
npm install
npm run db:migrate            # ຫຼື npm run db:push ສຳລັບ dev ໄວໆ
npm run seed                  # 1 tenant + primary domain + admin + demo data
npm run ui:build              # ສ້າງ admin UI ໃຫ້ server serve ທີ່ /
npm run dev
```

Ports ທີ່ໃຊ້: API `5055`, MySQL `3315`, Redis `6390` (ເລືອກເພື່ອບໍ່ຊົນກັບໂປຣເຈັກອື່ນ).

> `npm run dev` ມີ `predev` ກວດ port. ຖ້າ 5055 ຖືກໃຊ້ຢູ່ ຈະແຈ້ງ:
> `lsof -nP -iTCP:5055 -sTCP:LISTEN` ເພື່ອຫາ process ແລ້ວ kill, ຫຼື `PORT=5056 npm run dev` (ຕ້ອງແກ້ `NUXT_PUBLIC_API_BASE` ຂອງ client ນຳ).

ບັນຊີ dev ທີ່ seed ໃຫ້:

| ບ່ອນ | Email | Password |
|---|---|---|
| Platform console | `PLATFORM_ADMIN_EMAIL` ຫຼື `PLATFORM_ADMIN_USERNAME` | `PLATFORM_ADMIN_PASSWORD` |
| Platform superadmin | `superadmin` | `sa123456` |
| Tenant `saiyfon` | `admin@saiyfon.com` | `Demo@1234` |

> Login ຮັບໄດ້ທັງ email ແລະ username (`/login`).
> ປ່ຽນລະຫັດຜ່ານກ່ອນ production. `npm run seed` ເປັນ idempotent: ຈະ ensure platform admin
> (`/login`), plan, tenant `DEFAULT_TENANT_SLUG`, primary domain, admin ແລະ demo data
> ໃຫ້ຄົບໂດຍບໍ່ສ້າງຊ້ຳ. ຖ້າຕ້ອງການແຍກຂັ້ນຕອນ ໃຊ້ `npm run seed:all` ຫຼື
> `seed:platform` / `seed:tenant` / `seed:demo`.

### Redis

- `REDIS_URL` ວ່າງ = ໃຊ້ in‑memory fallback (dev/test ເທົ່ານັ້ນ).
- Keys: `tenant:host:<host>`, `tenant:slug:<slug>`, `tenant:domains:all`.
- TTL: `TENANT_CACHE_TTL_MS` (default 60s). ທຸກ mutation ຂອງ tenant/domain ຈະ invalidate cache.

## 4. API ຫຼັກ

| Method | Path | ໝາຍເຫດ |
|---|---|---|
| GET | `/health`, `/api/health` | healthcheck (DB ping) |
| GET | `/api/public/tenant` | resolve ຈາກ Host ຫຼື `?slug=` |
| GET | `/api/public/plans` | ແຜນທີ່ເປີດໃຊ້ |
| POST | `/api/platform/auth/login` | platform token (`aud=platform`) |
| GET | `/api/platform/auth/me` | |
| GET/POST | `/api/platform/tenants` | list/create |
| GET/PATCH/DELETE | `/api/platform/tenants/:id` | |
| POST | `/api/platform/tenants/:id/suspend`, `/activate` | |
| POST | `/api/platform/tenants/:id/domains` | custom domain → pending |
| POST | `/api/platform/tenants/:id/domains/:domainId/verify` | ກວດ TXT (`?force=true` ໃນ dev) |
| POST | `/api/platform/tenants/:id/impersonate` | token tenant ອາຍຸສັ້ນ + audit |
| POST | `/api/platform/tenants/:id/demo-data` | ສ້າງຂໍ້ມູນ Demo, ຖ້າມີຂໍ້ມູນແລ້ວຈະ 409 |
| POST | `/api/platform/tenants/:id/reset-data` | ລຶບຂໍ້ມູນທຸລະກິດ, ເກັບ admin/settings/plan/domains |
| GET | `/api/platform/tenants/:id/usage` | users/customers/policies |
| GET/POST/PATCH | `/api/platform/plans` | |
| GET | `/api/platform/audit-logs` | |
| POST | `/api/tenant/auth/login`, `/register` | tenant login/register |
| GET | `/api/tenant/auth/me` | |
| GET/POST/PATCH | `/api/tenant/users` | tenant admin ຈັດການຜູ້ໃຊ້ + `/stats` |
| GET | `/api/internal/tls/allow?domain=` | ສຳລັບ Caddy on‑demand TLS (legacy `/internal` ຍັງໃຊ້ໄດ້) |

Response: list `{ data, meta }`, single/mutation `{ data }`, error `{ error: { code, message, details? } }`.

**Path convention:** `/api/public/*` (public), `/api/platform/*` (platform JWT), `/api/tenant/*` (tenant JWT + Host/`X-Tenant`), `/api/internal/*` (token-protected), `/api/health`.

**Legacy aliases:** `/api/auth/*`, `/api/users/*`, `/api/<resource>` ຍັງໃຊ້ໄດ້ຊົ່ວຄາວ ສຳລັບ mobile app ເກົ່າ. Response ຈະມີ `Deprecation`, `Sunset`, `Link` headers. ຕັ້ງວັນລຶບດ້ວຍ `API_LEGACY_SUNSET` (default `2027-01-31`).

## 5. ສ້າງ Tenant

```bash
curl -X POST http://localhost:5055/api/platform/tenants \
  -H "Authorization: Bearer <platform-token>" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Acme Insurance",
    "slug": "acme",
    "planCode": "pro",
    "customDomain": "insurance.acme.com",
    "admin": { "email": "admin@acme.com", "password": "Secret123!", "username": "acmeadmin" }
  }'
```

- Default domain: `acme.saiyfon.app` (verified ອັດຕະໂນມັດ).
- Custom domain: ຕ້ອງຕັ້ງ CNAME → `CNAME_TARGET` ແລະ TXT `_saiyfon-verify.<domain>` = `saiyfon-verify=<token>`.
- ຫຼັງ verify Sig: server ຈະອະນຸຍາດ TLS ຜ່ານ `/api/internal/tls/allow`.
- Delete tenant = soft-delete (ເກັບຂໍ້ມູນ) ແລະ ປ່ອຍ slug/domain ໃຫ້ໃຊ້ຄືນໄດ້ (ປ່ຽນເປັນ `<id>-deleted-...`).

## 6. Coolify deployment (Dockerfile)

### ແບບລວມ API + Admin UI (ແນະນຳ)

ໃຊ້ `Dockerfile` ຢູ່ **root** ຂອງ repo (build ທັງ `server/` ແລະ `admin/`):

1. Resource → Dockerfile; **Base Directory: `/` (root)**; Dockerfile: `/Dockerfile`; Port: `5055`.
2. Healthcheck path: `/health`.
3. Admin UI ຈະຖືກ serve ຢູ່ `/` (login: `/login`) ຈາກ Express ດຽວກັນ.
4. Build args: `NUXT_PUBLIC_API_BASE=/api` (default), `NUXT_PUBLIC_ROOT_DOMAIN=saiyfon.app`.
5. ຕັ້ງ Environment Variables ຕາມ `.env.example` (ຢ່າ commit `.env`).

> `server/Dockerfile` ແມ່ນ **API-only** (ບໍ່ມີ admin UI) — ໃຊ້ສຳລັບ admin static ແຍກ ຫຼື API ຢ່າງດຽວ.

1. ສ້າງ Resource → **Dockerfile** build pack.
2. Port: `5055`; Healthcheck: `/health`.
3. ຕັ້ງ Environment Variables ຕາມ `.env.example` (ຢ່າ commit `.env`).
   - `NODE_ENV=production`
   - `DATABASE_URL` (MySQL ພາຍນອກ/Managed)
   - `REDIS_URL` (Redis ພາຍນອກ/Managed)
   - `JWT_SECRET`, `PLATFORM_JWT_SECRET` (ຕ່າງກັນ, ສຸ່ມຍາວ)
   - `ROOT_DOMAIN`, `ADMIN_HOST`, `CNAME_TARGET`
   - `TLS_ASK_TOKEN`
   - `DB_DOCTOR_MODE=repair` (ແນະນຳ: apply migration + ກວດ schema ອັດຕະໂນມັດທຸກ deploy)
   - `DB_DOCTOR_FAIL_ON=critical`
   - `DB_DOCTOR_DATA_CHECKS=true`
   - `RUN_MIGRATIONS_ON_START` ເປັນ legacy; ໃຊ້ `DB_DOCTOR_MODE=repair` ແທນ
6. ເປີດ Domain `admin.saiyfon.app` (ຫຼື `api.saiyfon.app`) ຊີ້ໄປ container ດຽວກັນ.
7. ຢ່າໃຊ້ persistent volume ສຳລັບ code; ຂໍ້ມູນຢູ່ MySQL, cache ຢູ່ Redis.

```bash
# ລວມ UI (root context)
docker build -t saiyfon-server .
docker run --rm -p 5055:5055 --env-file server/.env saiyfon-server

# API-only
docker build -f server/Dockerfile -t saiyfon-api server
```

## 7. Reverse proxy + TLS (Caddy ຕົວຢ່າງ)

```caddyfile
{
  on_demand_tls {
    ask https://api.saiyfon.app/api/internal/tls/allow?token=<TLS_ASK_TOKEN>
  }
}

# default tenant subdomains
*.saiyfon.app {
  tls {
    dns cloudflare {env.CF_API_TOKEN}
  }
  reverse_proxy 127.0.0.1:5055
}

# custom tenant domains (certificate on demand)
:443 {
  tls {
    on_demand
  }
  reverse_proxy 127.0.0.1:5055
}
```

> ຖ້າໃຊ້ Cloudflare for SaaS ສາມາດປ່ຽນແທນ on‑demand TLS ໄດ້. Wildcard cert ບໍ່ຄຸມ custom domain.

## 8. Migrations

```bash
npm run db:generate     # ສ້າງ SQL ໃນ drizzle/
npm run db:check:static # ກວດ schema ກັບ snapshot (build ຈະລັນອັດຕະໂນມັດ)
npm run db:migrate      # apply
npm run db:doctor       # ກວດ DB ແບບບໍ່ແກ້
npm run db:doctor:repair # apply migration + repair additive
npm run db:push         # dev ໄວໆ (ບໍ່ແນະນຳ production)
```

DB Doctor ຈະລັນກ່ອນ server ເມື່ອ `DB_DOCTOR_MODE` ບໍ່ແມ່ນ `off`:

- ກວດ migration count/hash/out-of-order
- apply pending migrations ພາຍໃຕ້ `GET_LOCK`
- ກວດ schema ຕົວຈິງກັບ Drizzle schema
- repair additive: add column/index/FK ທີ່ຂາດ
- ກວດ data integrity ແລະບັນທຶກ `db_doctor_runs`
- critical issue → exit 1 (deploy fail); warning → server ລັນຕໍ່

ສຳລັບ DB ທີ່ມີຂໍ້ມູນເກົ່າ: ໃຫ້ baseline migration ຫຼື ໃຊ້ `db:push` ໃນ dev ກ່ອນ, ແລ້ວຄ່ອຍປ່ຽນ `tenant_id` ເປັນ `NOT NULL` ຫຼັງ backfill.

## 9. ຄວາມປອດໄພ

- CORS ເປັນ allowlist: admin host, exact root domain, verified tenant domains (from `tenant_domains`), `CORS_EXTRA_ORIGINS`; `CORS_ALLOW_ROOT_SUBDOMAINS=false` ບໍ່ອະນຸຍາດ subdomain ທີ່ຍັງບໍ່ verified; dev ອະນຸຍາດ localhost ທຸກ port.
- Rate limit (Redis-backed): tenant login 100/15ນາທີ, register 30/15ນາທີ, platform login 30/15ນາທີ.
- Plan limits ບັງຄັບຕອນສ້າງ user/policy (`maxUsers`, `maxPolicies`; 0 = ບໍ່ຈຳກັດ) → 403 `plan_limit_reached`.
- JWT 2 realm, ກວດ tenant match; ຂໍ້ມູນທຸກ query scope ດ້ວຍ `tenantId`.
- Audit log ບັນທຶກ action ຂອງ platform (create/update/suspend/delete/domain/impersonate).
- ຍັງບໍ່ມີ MFA, billing, per-agent row scoping, ແລະ server integration tests (unit tests ມີແລ້ວ).

## 10. Tests

```bash
npm test        # 47 ເຄສ: JWT realm, validation, CORS, DB Doctor
npm run typecheck
npm run build
```
