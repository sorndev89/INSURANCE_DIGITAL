# SAIYFON Insurance Digital

Multi-tenant SaaS for insurance management (Lao UI).

## Stack

- **Frontend (tenant app)**: Nuxt 4, Vue 3, Tailwind v4, Konsta UI, Pinia, Capacitor
- **SaaS console**: Nuxt 4 SPA (`admin/`), Tailwind v4, served as static site
- **Backend**: Node.js, Express 5, Drizzle ORM, MySQL 8, Redis 7, JWT, Bcrypt
- **SaaS control plane**: `/api/platform` (tenant/domain/plan/audit)
- **Tenant API**: `/api/tenant/*` (auth/users/data), **public**: `/api/public/*`, **internal**: `/api/internal/*`

## How to run

### 1. Server (API + SaaS control plane)

```bash
cd server
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d   # MySQL 3315 + Redis 6390
npm install
npm run db:migrate
npm run seed          # 1 tenant + primary domain + admin + demo dashboard data
npm run dev
npm test
```

- API: `http://localhost:5055`
- **SaaS UI (served by server): `http://localhost:5055/`**
- Health: `http://localhost:5055/health`
- Platform login: `PLATFORM_ADMIN_EMAIL` ຫຼື `PLATFORM_ADMIN_USERNAME` + `PLATFORM_ADMIN_PASSWORD` in `.env`
- Platform superadmin: `superadmin` / `sa123456`
- Tenant login: `admin@saiyfon.com` / `Demo@1234` (dev seed; also staff/agent/customer)
- `npm run seed` ສ້າງ platform admin (`http://localhost:5055/login`), tenant ເລີ່ມຕົ້ນ 1 ລາຍ (`DEFAULT_TENANT_SLUG`) ພ້ອມ primary domain ແລະ demo data; ສາມາດ run ຊ້ຳໄດ້. ໃຊ້ `npm run seed:all` ຖ້າຕ້ອງການແຍກ `seed:platform` / `seed:tenant` / `seed:demo`.

Deployment (API + UI in one image): root `Dockerfile` + Coolify — see `server/README.md`.

### 2. Client (tenant app)

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

### 3. Admin (SaaS console)

**ແບບ serve ຈາກ server (ແນະນຳ):** `cd server && npm run ui:build && npm run dev` → ເປີດ `http://localhost:5055`.

**ແບບ dev ແຍກ:**

```bash
cd admin
npm install
cp .env.example .env
npm run dev -- --port 3001
```

- Console: `http://localhost:3001` ຫຼື `http://localhost:5055`
- Login ດ້ວຍ `PLATFORM_ADMIN_EMAIL` / `PLATFORM_ADMIN_PASSWORD` ຈາກ `server/.env`
- Deploy: static Dockerfile + Coolify — see `admin/README.md`

## Multi-tenancy

- `client/` ເປັນ app ດຽວສຳລັບທຸກ tenant; branding ມາຈາກ `GET /api/public/tenant` ຕາມ domain.
- ຂໍ້ມູນ tenant ທັງໝົດຢູ່ `/api/tenant/*`; path ເກົ່າ (`/api/auth`, `/api/customers`, ...) ຍັງໃຊ້ໄດ້ຊົ່ວຄາວສຳລັບ mobile app ເກົ່າ.
- Default tenant domain: `<slug>.<ROOT_DOMAIN>`; custom domain ຜ່ານ CNAME + TXT verification.
- ຂໍ້ມູນແຍກດ້ວຍ `tenant_id` ໃນ MySQL ດຽວ (shared database).

## Language Support

- Lao (Primary UI)
