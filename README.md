# SAIYFON Insurance Digital

ລະບົບຄຸ້ມຄອງການປະກັນໄພແບບດິຈິຕອນ ສຳລັບບໍລິສັດນາຍໜ້າປະກັນໄພ ແລະ ຕົວແທນຂາຍ.
ເປັນ **Multi-tenant SaaS** ທີ່ໃຊ້ລະບົບດຽວຮອງຮັບຫຼາຍບໍລິສັດ (tenant) ໂດຍແຍກຂໍ້ມູນດ້ວຍ `tenant_id`,
ມີ UI ພາສາລາວເປັນຫຼັກ ແລະ ຮອງຮັບທັງ Desktop, Tablet, Mobile ລວມເຖິງ iOS/Android ຜ່ານ Capacitor.

> ອັບເດດຂໍ້ມູນ: 2026-10-26

---

## ສາລະບານ

1. [ພາບລວມລະບົບ](#1-ພາບລວມລະບົບ)
2. [ສະຖາປັດຕະຍະກຳ](#2-ສະຖາປັດຕະຍະກຳ)
3. [ເຕັກໂນໂລຢີ](#3-ເຕັກໂນໂລຢີ)
4. [ໂຄງສ້າງໂປຣເຈັກ](#4-ໂຄງສ້າງໂປຣເຈັກ)
5. [ໂມດູນ ແລະ ຟີເຈີ](#5-ໂມດູນ-ແລະ-ຟີເຈີ)
6. [ບົດບາດ ແລະ ສິດເຂົ້າເຖິງ](#6-ບົດບາດ-ແລະ-ສິດເຂົ້າເຖິງ)
7. [ຖານຂໍ້ມູນ](#7-ຖານຂໍ້ມູນ)
8. [API](#8-api)
9. [Multi-tenancy ແລະ Branding](#9-multi-tenancy-ແລະ-branding)
10. [ການຕິດຕັ້ງ ແລະ ການລັນ](#10-ການຕິດຕັ້ງ-ແລະ-ການລັນ)
11. [Environment Variables](#11-environment-variables)
12. [ການທົດສອບ](#12-ການທົດສອບ)
13. [ການ Deploy](#13-ການ-deploy)
14. [ຄວາມປອດໄພ](#14-ຄວາມປອດໄພ)
15. [ເອກະສານ ແລະ ສະຖານະ](#15-ເອກະສານ-ແລະ-ສະຖານະ)

---

## 1. ພາບລວມລະບົບ

ໂປຣເຈັກແບ່ງເປັນ 3 ແອັບພລິເຄຊັນ:

| ສ່ວນ | ໄດເຣັກທໍຣີ | ໜ້າທີ່ |
|---|---|---|
| **Tenant App** | `client/` | ແອັບຫຼັກຂອງບໍລິສັດປະກັນໄພ: ຂາຍ, ປະກັນໄພ, ລູກຄ້າ, ຕົວແທນ, ເຄມ, ການເງິນ, ລາຍງານ |
| **SaaS Console** | `admin/` | ໜ້າຄຸ້ມຄອງລະດັບ platform: tenant, domain, plan, audit log |
| **API Server** | `server/` | Express API ທັງ control plane ແລະ data plane + serve admin UI |

### ຄວາມສາມາດຫຼັກ

- ຈັດການປະກັນໄພ: ສ້າງ, ຄົ້ນຫາ, ກັ່ນຕອງ, ເບິ່ງລາຍລະອຽດ, ປ່ຽນສະຖານະ.
- ຟອມຊື້ປະກັນໄພ 5 ຂັ້ນຕອນ ພ້ອມຄຳນວນເບ້ຍປະກັນ, ສ່ວນຫຼຸດ, VAT 7% ແລະ ຄ່າທະບຽນ.
- ສະເໜີລາຄາ (Quotation), ລູກຄ້າ, ຍານພາຫະນະ, ບໍລິສັດປະກັນໄພ ແລະ ຜະລິດຕະພັນ.
- ຕົວແທນ, ທີມ, ເປົ້າໝາຍຂາຍ, ວົງເງິນສິນເຊື່ອ ແລະ ຄ່າຄອມມິດຊັ່ນ.
- ເຄມ (Claims): ແຈ້ງເຄມ, ຕິດຕາມສະຖານະ, ອະນຸມັດ/ປະຕິເສດ.
- ການເງິນ: ໃບແຈ້ງໜີ້ (Invoice), ການຊຳລະ (Payment), ໃບຮັບເງິນ.
- ລາຍງານທຸລະກິດ: KPI, ຍອດຂາຍລາຍເດືອນ, ສັດສ່ວນປະເພດປະກັນໄພ, ຕົວແທນຍອດດີ.
- ຈັດການຜູ້ໃຊ້ງານ, ສິດທິຕາມບົດບາດ ແລະ ການຕັ້ງຄ່າລະບົບ.
- SaaS control plane: ສ້າງ/ແກ້ໄຂ/ປິດໃຊ້ tenant, ແຜນບໍລິການ, custom domain + DNS verification,
  branding, usage, impersonate ແລະ audit log.
- Multi-tenant branding ອັດຕະໂນມັດ (ສີ, ໂລໂກ້, ຊື່, ສະກຸນເງິນ, locale) ຜ່ານ CSS variables.
- Mock mode ສຳລັບພັດທະນາ UI ແບບ offline (`NUXT_PUBLIC_USE_MOCK=true`).

---

## 2. ສະຖາປັດຕະຍະກຳ

```text
                    ┌─────────────────────────────┐
                    │        client/ (SPA)        │
                    │  Nuxt 4 · Vue 3 · Pinia     │
                    │  Web + Capacitor iOS/Android│
                    └──────────────┬──────────────┘
                                   │  Host / X-Tenant
                                   │  Authorization: Bearer
                    ┌──────────────▼──────────────┐
                    │        admin/ (SPA)         │
                    │  Nuxt 4 · Platform JWT      │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      server/ (Express 5)    │
                    │  Control Plane + Data Plane │
                    │  Drizzle ORM · JWT 2 realm  │
                    └───────┬─────────────┬───────┘
                            │             │
                  ┌─────────▼───┐   ┌─────▼──────┐
                  │  MySQL 8    │   │  Redis 7   │
                  │ shared DB   │   │ cache +    │
                  │ tenant_id   │   │ rate limit │
                  └─────────────┘   └────────────┘
```

### ຫຼັກການເຮັດວຽກ

1. **Tenant resolution** — ລະບຸ tenant ຈາກ `Host` (web/custom domain) ຫຼື header `X-Tenant` (mobile/dev).
2. **JWT 2 realm** — token tenant (`aud=tenant`) ແລະ token platform (`aud=platform`) ໃຊ້ secret ຄົນລະຕົວ.
3. **Data isolation** — ທຸກ query ທຸລະກິດຜ່ານ repository/controller ທີ່ scope ດ້ວຍ `tenant_id`.
4. **Control plane** — `/api/platform/*` ຈັດການ tenant, plan, domain, audit.
5. **Data plane** — `/api/tenant/*` ໃຫ້ບໍລິການຂໍ້ມູນຂອງແຕ່ລະ tenant.
6. **Admin UI** — Express ສາມາດ serve `admin/.output/public` ຢູ່ `/` ພາຍໃຕ້ origin ດຽວກັນ.

---

## 3. ເຕັກໂນໂລຢີ

| ຊັ້ນ | ເຕັກໂນໂລຢີ |
|---|---|
| Tenant App | Nuxt 4.3 (`ssr: false`), Vue 3.5, Pinia 3, Vue Router 4 |
| UI / Styling | Tailwind CSS 4 (`@theme` tokens), Konsta UI 5, Material Icons |
| Responsive | `@vueuse/nuxt`, `@nuxtjs/device`, 3 layout: desktop / tablet / mobile |
| Native | Capacitor 8 (Android, iOS, Camera, Preferences, Keyboard, Status Bar, Splash) |
| Admin Console | Nuxt 4.3 (`ssr: false`), Vue 3.5, Tailwind CSS 4, light/dark theme |
| Backend | Node.js, TypeScript, Express 5, Drizzle ORM 0.45, MySQL 8, Redis 7 |
| Auth / Security | JWT (`jsonwebtoken`), bcryptjs, RBAC, rate limit ຜ່ານ Redis |
| Testing | Vitest 5 + Vue Test Utils, Playwright + axe-core, Node test runner (server) |
| Tooling | ESLint, Prettier, Drizzle Kit, tsx, Docker, Coolify |

---

## 4. ໂຄງສ້າງໂປຣເຈັກ

```text
SAIYFON_INSURANCE_DIGITAL/
├── client/                     # Tenant app (Nuxt 4 SPA + Capacitor)
│   ├── app/
│   │   ├── assets/{css,fonts,img}
│   │   ├── components/{base,ui,shell,feature}
│   │   ├── composables/api/    # usePolicies, useCustomers, useClaims, ...
│   │   ├── config/             # navigation.js, permissions.js, api.js
│   │   ├── layouts/            # auth, desktop, tablet, mobile, blank
│   │   ├── middleware/         # auth.global, permission.global
│   │   ├── mocks/              # ຂໍ້ມູນ mock ສຳລັບ dev/test
│   │   ├── pages/              # ໜ້າທັງໝົດ
│   │   ├── plugins/            # tenant bootstrap, layout resolver
│   │   ├── stores/             # auth, tenant, ui
│   │   └── utils/              # premium, format, color, validation
│   ├── android/ · ios/         # Capacitor native projects
│   ├── docs/                   # glossary, api-contract, plan, status
│   └── tests/{unit,e2e}
│
├── admin/                      # SaaS console (Nuxt 4 SPA)
│   ├── app/assets/css/         # design tokens + components (light/dark)
│   ├── app/components/         # StatCard, StatusBadge, PageHeader, AppModal, ...
│   ├── app/composables/        # useApi, usePlatformAuth, useTheme, useFormat
│   └── app/pages/              # dashboard, tenants, plans, domains, audit, system/health
│
├── server/                     # Express API + control/data plane
│   ├── src/
│   │   ├── app.ts              # middleware + routes
│   │   ├── index.ts            # bootstrap + graceful shutdown
│   │   ├── config/env.ts       # env validation
│   │   ├── db/{schema,migrate,index}.ts
│   │   ├── middleware/         # tenantResolver, auth, platformAuth, cors, rateLimit, limits
│   │   ├── controllers/        # auth, users, public, tenants, plans, audit, policies, ...
│   │   ├── repositories/       # query ທີ່ scope tenantId
│   │   ├── services/           # cache, tenantCache, provisioning, domains, audit
│   │   ├── routes/             # public, platform, tenant, internal
│   │   ├── scripts/            # seed-initial/platform/tenant/demo
│   │   └── utils/              # auth, validate, errors, list
│   ├── drizzle/                # SQL migrations
│   └── docker-compose.dev.yml  # MySQL 3315 + Redis 6390
│
├── Dockerfile                  # ລວມ API + Admin UI
├── client/Dockerfile           # Tenant App (Nuxt generate + Nginx)
├── client/nginx.conf           # SPA fallback + cache + healthcheck
├── Project.txt                 # ເອກະສານ requirement ເດີມ
└── README.md
```

---

## 5. ໂມດູນ ແລະ ຟີເຈີ

### 5.1 Tenant App (`client/`)

| ໂມດູນ | ເສັ້ນທາງ | ລາຍລະອຽດ |
|---|---|---|
| Dashboard | `/dashboard` | KPI, ຍອດຂາຍ, ອັດຕາເຄມ, ກຣາຟລາຍເດືອນ, ສັດສ່ວນປະເພດ |
| ໜ້າຫຼັກ | `/home` | ສຳລັບ agent/customer: ທາງລັດ, ປະກັນໄພໃກ້ໝົດອາຍຸ, ສະຖິຕິ |
| ປະກັນໄພ | `/policies` | ລາຍການ, ຄົ້ນຫາ, ກັ່ນຕອງ, ລາຍລະອຽດ, ປ່ຽນສະຖານະ, ຍົກເລີກ |
| ສ້າງປະກັນໄພ | `/policies/create` | Wizard 5 ຂັ້ນຕອນ: ຜູ້ເອົາປະກັນ → ລົດ → ແຜນ → ເບ້ຍ/ສ່ວນຫຼຸດ → ຊຳລະ |
| ສະເໜີລາຄາ | `/quotations` | ສ້າງ, ລາຍລະອຽດ, ສະຖານະ draft/sent/accepted/expired |
| ລູກຄ້າ | `/customers` | ຂໍ້ມູນສ່ວນຕົວ, ບັດປະຊາຊົນ/ພາສປອດ, ທີ່ຢູ່, ອາຊີບ |
| ຕົວແທນ | `/agents` | ລະຫັດຕົວແທນ, ລະດັບ, ເປົ້າໝາຍ, credit limit, ຄອມມິດຊັ່ນ |
| ທີມ | `/teams` | ໂຄງສ້າງທີມ, ຫົວໜ້າທີມ, ສະມາຊິກ, ຍອດຂາຍ |
| ຄອມມິດຊັ່ນ | `/commissions` | ຕິດຕາມ ແລະ ຈ່າຍຄ່າຄອມມິດຊັ່ນ |
| ເຄມ | `/claims` | ລາຍການ, ແຈ້ງເຄມໃໝ່, ລາຍລະອຽດ, ອະນຸມັດ/ປະຕິເສດ |
| ໃບແຈ້ງໜີ້ | `/finance/invoices` | ສະຖານະ unpaid/overdue/paid, ສ້າງໃບແຈ້ງໜີ້ |
| ການຊຳລະ | `/finance/payments` | ໃບຮັບເງິນ, ຊ່ອງທາງຊຳລະ, ສະຖານະ |
| ລາຍງານ | `/reports` | KPI, ຍອດຂາຍ 12 ເດືອນ, product mix, top agents |
| ຜູ້ໃຊ້ງານ | `/users` | ຈັດການຜູ້ໃຊ້, ບົດບາດ, ສະຖານະ |
| ຕັ້ງຄ່າ | `/settings` | ຂໍ້ມູນບໍລິສັດ, ສິດທິ, ການແຈ້ງເຕືອນ, backup |
| ໂປຣໄຟລ໌ | `/profile` | ຂໍ້ມູນຜູ້ໃຊ້, ອອກຈາກລະບົບ |
| Dev catalog | `/dev/components`, `/dev/tokens` | ສະເພາະ dev: ຕົວຢ່າງ component ແລະ design token |

**ໜ້າລະບົບ:** `/login`, `/forgot-password`, `/403`, `/maintenance`,
`/tenant-not-found`, `/select-company` (mobile ເລືອກບໍລິສັດ).

#### ສູດຄຳນວນເບ້ຍປະກັນ

```text
discountAmount = round(basePremium × discountPercent / 100)
netPremium     = basePremium − discountAmount
vatAmount      = round(netPremium × 0.07)          # VAT 7%
totalPremium   = netPremium + vatAmount + 20,000   # ຄ່າທະບຽນ LAK
```

ຄ່າຄົງທີ່ຢູ່ `client/app/utils/premium.js`.

#### ສະຖານະຫຼັກ

| ຂໍ້ມູນ | ສະຖານະ |
|---|---|
| Policy | `pending`, `active`, `expired`, `cancelled` |
| Quotation | `draft`, `sent`, `accepted`, `expired` |
| Claim | `pending`, `reviewing`, `approved`, `rejected` |
| Invoice | `unpaid`, `overdue`, `paid` |
| Payment | `pending`, `completed` |
| Commission | `pending`, `paid` |
| Tenant | `active`, `trial`, `suspended` |
| Subscription | `trialing`, `active`, `past_due`, `cancelled` |

### 5.2 SaaS Console (`admin/`)

| ໜ້າ | ເສັ້ນທາງ | ລາຍລະອຽດ |
|---|---|---|
| Login | `/login` | ເຂົ້າລະບົບດ້ວຍ platform account |
| Dashboard | `/dashboard` | KPI ອົງກອນ, active/trial/suspended, plans, ສະຖານະລະບົບ, ອົງກອນຫຼ້າສຸດ, audit ຫຼ້າສຸດ |
| Tenants | `/tenants` | ລາຍການ, ຄົ້ນຫາ, ສ້າງ tenant, ສະແດງ DNS ຫຼັງສ້າງ |
| Tenant detail | `/tenants/:id` | ຕັ້ງຄ່າ, plan, branding, domain + verify, usage, impersonate, suspend/delete |
| Plans | `/plans` | ສ້າງ/ແກ້ໄຂແຜນ, ເປີດ/ປິດ, limits ແລະ features |
| Custom Domains | `/domains` | ລວບລວມ domain ທຸກ tenant, ສະຖານະ DNS verification ແລະ SSL |
| Audit | `/audit` | ປະຫວັດການກະທຳຂອງ platform ພ້ອມ filter |
| System Health | `/system/health` | ຕິດຕາມສະຖານະ MySQL, Redis, API Gateway ແລະ background worker (ຂໍ້ມູນ static/mock ໃນປັດຈຸບັນ) |

**UI:** sidebar ແບບ group, responsive ສຳລັບ mobile, ຮອງຮັບ **light/dark theme**
(`useTheme` + CSS tokens), ມີ component ກາງເຊັ່ນ `StatCard`, `StatusBadge`,
`PageHeader`, `AppModal`, `CopyButton`.

---

## 6. ບົດບາດ ແລະ ສິດເຂົ້າເຖິງ

### Platform (SaaS Console)

| ບົດບາດ | ສິດ |
|---|---|
| `superadmin` | ທຸກ action: tenant, plan, domain, impersonate, audit |
| `support` | ເບິ່ງ tenants/plans/audit ແລະ impersonate ໄດ້ (ບໍ່ສ້າງ/ແກ້ໄຂ tenant) |

### Tenant (Tenant App)

| ບົດບາດ | ລາຍລະອຽດ | ໜ້າເລີ່ມຕົ້ນ |
|---|---|---|
| `admin` | ສິດທັງໝົດ (`*`) | `/dashboard` |
| `staff` | ຂາຍ, ປະກັນໄພ, ສະເໜີລາຄາ, ລູກຄ້າ, ເຄມ, ການເງິນ, ລາຍງານ | `/dashboard` |
| `agent` | ຂາຍ/ສ້າງປະກັນໄພ, ສະເໜີລາຄາ, ລູກຄ້າ, ເບິ່ງຄອມມິດຊັ່ນ, ແຈ້ງເຄມ | `/home` |
| `customer` | ເບິ່ງ/ຊື້ປະກັນໄພ, ສະເໜີລາຄາ, ແຈ້ງເຄມ, ຊຳລະ, ໂປຣໄຟລ໌ | `/home` |

ສິດຖືກກຳນົດຢູ່ `client/app/config/permissions.js` ແລະ ກວດຜ່ານ
`middleware/auth.global.js` + `middleware/permission.global.js`.

---

## 7. ຖານຂໍ້ມູນ

ໃຊ້ **MySQL ຖານດຽວ (shared database)** ແລະ ແຍກຂໍ້ມູນທຸລະກິດດ້ວຍ `tenant_id`.
Schema ຢູ່ `server/src/db/schema.ts` ແລະ migration ຢູ່ `server/drizzle/`.

### 7.1 Control plane

| ຕາຕະລາງ | ໜ້າທີ່ |
|---|---|
| `plans` | ແຜນບໍລິການ, ລາຄາ, limits (`maxUsers`, `maxPolicies`, `storageMb`), features |
| `tenants` | ບໍລິສັດ/tenant, slug, ສະຖານະ, plan, settings (brand, locale, currency, features, contact) |
| `tenant_domains` | primary/custom domain, verification token, verifiedAt, SSL status |
| `subscriptions` | ສະຖານະການສະໝັກ, ວັນເລີ່ມ/ໝົດອາຍຸ |
| `platform_users` | ຜູ້ໃຊ້ console, role `superadmin`/`support`, MFA flag |
| `platform_audit_logs` | audit ການກະທຳຂອງ platform, actor, target, IP, meta |

### 7.2 Tenant data plane

| ຕາຕະລາງ | ໜ້າທີ່ / ຂໍ້ມູນຫຼັກ |
|---|---|
| `users` | ຜູ້ໃຊ້ tenant, role, phone, status; unique `(tenant_id, email)`, `(tenant_id, username)` |
| `teams` | ທີມຂາຍ, ຫົວໜ້າ, ສະມາຊິກ, ຍອດຂາຍ |
| `customers` | ຂໍ້ມູນລູກຄ້າ/ຜູ້ເອົາປະກັນ, ເອກະສານ, ຮູບບັດ |
| `agents` | ລະຫັດຕົວແທນ, ທີມ, ລະດັບ, credit limit, sales target, commission/tax rate |
| `insurance_companies` | ບໍລິສັດປະກັນໄພ (code, name, contact, logo) |
| `products` | ຜະລິດຕະພັນ: Motor, Health, Fire |
| `vehicles` | ຍີ່ຫໍ້, ຮຸ່ນ, ປີ, ທະບຽນ, ເລກຈັກ, ເລກຖັງ, ຄວາມຈຸ, ການໃຊ້ງານ |
| `policies` | ປະກັນໄພ: policy number, ວັນທີ, net/VAT/registration/total, ສະຖານະ |
| `commission_rates` | override ອັດຕາຄອມມິດຊັ່ນຕາມ agent + product |
| `quotations` | ໃບສະເໜີລາຄາ, reference, premium, validUntil, ສະຖານະ |
| `claims` | ເຄມ: claim number, policy, ປະເພດ, ວັນເກີດເຫດ, ວົງເງິນ, ເອກະສານ |
| `invoices` | ໃບແຈ້ງໜີ້, ວັນອອກ/ກຳນົດ, ສະຖານະ |
| `payments` | ໃບຮັບເງິນ, invoice, ຊ່ອງທາງ, ວັນທີ, ສະຖານະ |
| `commissions` | ຄ່າຄອມມິດຊັ່ນຕາມ agent/policy, rate, amount, ສະຖານະ |

> Unique ແບບ composite ສຳຄັນ: `(tenant_id, email)`, `(tenant_id, username)`,
> `(tenant_id, policy_number)`, `(tenant_id, agent_code)`, `(tenant_id, invoice_number)` ແລະ ອື່ນໆ.

---

## 8. API

### 8.1 ຫຼັກການ

- Base URL dev: `http://localhost:5055/api`
- List response: `{ data, meta: { total, page, pageSize } }`
- Single/mutation response: `{ data }`
- Error response: `{ error: { code, message, details? } }`
- Auth header: `Authorization: Bearer <token>`
- Tenant header: `X-Tenant: <slug>` (mobile/dev) ຫຼືອາໄສ page origin (`Origin` ຕອນ cross-origin, ຫຼື `Host` ຕອນ same-origin)
- Query ມາດຕະຖານ: `?page=1&pageSize=10&search=&sort=createdAt&order=desc`

### 8.2 Endpoint ຫຼັກ

| Method | Path | ໝາຍເຫດ |
|---|---|---|
| GET | `/health`, `/api/health` | healthcheck + DB ping |
| GET | `/api/public/tenant` | resolve tenant ຈາກ `?slug=`, `?host=`, `X-Tenant-Host`, `Origin` ຫຼື `Host` |
| GET | `/api/public/plans` | ແຜນທີ່ເປີດໃຊ້ |
| POST | `/api/platform/auth/login` | platform login (email ຫຼື username) |
| GET | `/api/platform/auth/me` | platform profile |
| GET/POST | `/api/platform/tenants` | list/create tenant |
| GET/PATCH/DELETE | `/api/platform/tenants/:id` | detail/update/soft-delete |
| POST | `/api/platform/tenants/:id/suspend` · `/activate` | ປິດ/ເປີດ tenant |
| POST | `/api/platform/tenants/:id/domains` | ເພີ່ມ custom domain |
| POST | `/api/platform/tenants/:id/domains/:domainId/verify` | ກວດ TXT record |
| POST | `/api/platform/tenants/:id/impersonate` | ອອກ token tenant ອາຍຸສັ້ນ + audit |
| GET | `/api/platform/tenants/:id/usage` | ການໃຊ້ users/customers/policies |
| GET/POST/PATCH | `/api/platform/plans` | ຈັດການແຜນ |
| GET | `/api/platform/audit-logs` | audit log |
| POST | `/api/tenant/auth/register` | tenant register |
| POST | `/api/tenant/auth/login` | tenant login |
| GET | `/api/tenant/auth/me` | tenant profile |
| GET | `/api/tenant/users` | ລາຍການຜູ້ໃຊ້ (admin) |
| GET | `/api/tenant/users/stats` | ສະຖິຕິຜູ້ໃຊ້ |
| POST/PATCH | `/api/tenant/users` · `/:id` | ສ້າງ/ແກ້ໄຂຜູ້ໃຊ້ (admin, ມີ plan limit) |
| GET | `/api/tenant/dashboard` | ຂໍ້ມູນ dashboard |
| GET | `/api/tenant/customers` · `/stats` · `/:id` | ລູກຄ້າ |
| POST/PATCH | `/api/tenant/customers` | ສ້າງ/ແກ້ໄຂລູກຄ້າ |
| GET | `/api/tenant/agents` · `/stats` · `/:id` | ຕົວແທນ |
| GET/POST | `/api/tenant/teams` | ທີມ |
| GET | `/api/tenant/companies`, `/api/tenant/products` | ຂໍ້ມູນອ້າງອີງ |
| GET | `/api/tenant/policies` · `/stats` · `/:id` | ປະກັນໄພ |
| POST | `/api/tenant/policies` | ສ້າງປະກັນໄພ (plan limit) |
| PATCH | `/api/tenant/policies/:id/status` | ປ່ຽນສະຖານະ |
| GET | `/api/tenant/quotations` · `/stats` · `/:id` | ສະເໜີລາຄາ |
| POST/PATCH | `/api/tenant/quotations` · `/:id/status` | ສ້າງ/ປ່ຽນສະຖານະ |
| GET | `/api/tenant/claims` · `/stats` · `/:id` | ເຄມ |
| POST/PATCH | `/api/tenant/claims` · `/:id/status` | ແຈ້ງ/ອະນຸມັດເຄມ |
| GET | `/api/tenant/commissions` · `/stats` | ຄອມມິດຊັ່ນ |
| POST | `/api/tenant/commissions/:id/pay` | ຈ່າຍຄອມມິດຊັ່ນ |
| GET | `/api/tenant/invoices` · `/stats` | ໃບແຈ້ງໜີ້ |
| POST | `/api/tenant/invoices` | ສ້າງໃບແຈ້ງໜີ້ |
| GET | `/api/tenant/payments` · `/stats` | ການຊຳລະ |
| POST | `/api/tenant/payments` | ບັນທຶກການຊຳລະ |
| GET | `/api/internal/tls/allow?domain=` | ອະນຸຍາດ TLS ສຳລັບ reverse proxy |
| GET | `/api/internal/...` | internal endpoints (token-protected) |

### 8.3 Legacy API

`/api/auth/*`, `/api/users/*`, `/api/<resource>` ຍັງໃຊ້ໄດ້ຊົ່ວຄາວສຳລັບ mobile app ເກົ່າ.
Response ຈະມີ header `Deprecation`, `Sunset` ແລະ `Link` ຊີ້ໄປ `/api/tenant/*`.
ກຳນົດວັນລຶບຜ່ານ `API_LEGACY_SUNSET` (default `2027-01-31`).

---

## 9. Multi-tenancy ແລະ Branding

- `client/` ເປັນ build ດຽວສຳລັບທຸກ tenant; ບໍ່ແຍກ codebase ຕໍ່ tenant.
- ຕອນ boot `plugins/tenant.client.js` ຈະ resolve tenant:
  - **Web**: ຈາກ page origin (`Origin` — ສຳຄັນເມື່ອ API ຢູ່ຄົນລະ domain), ຫຼື `Host` ຕອນ same-origin
  - **localhost/dev**: ຈາກ slug ທີ່ບັນທຶກ ຫຼື `NUXT_PUBLIC_DEFAULT_TENANT_SLUG`
  - **Mobile**: ຈາກ Capacitor Preferences; ຖ້າຍັງບໍ່ມີ ຈະໄປ `/select-company`
- `stores/tenant.js` ເກັບ `{ slug, name, status, branding, features, locale, currency }`
  ແລະ ປ່ຽນ CSS variables `--sf-primary*`, title ແລະ theme-color.
- `composables/api/useApiClient.js` ໃສ່ `X-Tenant` ແລະ `Authorization` ໃນທຸກ request.
- Guards: `/tenant-not-found` (domain ບໍ່ຜູກ), `/maintenance` (tenant ຖືກປິດ),
  `/select-company` (mobile ເລືອກບໍລິສັດ).
- `NUXT_PUBLIC_TENANT_MODE=mock` ໃຊ້ branding ເລີ່ມຕົ້ນໂດຍບໍ່ຍິງ API (dev ໄວໆ).

---

## 10. ການຕິດຕັ້ງ ແລະ ການລັນ

### ຂໍ້ກຳນົດ

- Node.js 22 LTS ຫຼືໃໝ່ກວ່າ (Docker image ໃຊ້ Node 24)
- npm 10+
- Docker + Docker Compose (ສຳລັບ MySQL/Redis dev)

### 10.1 Server (API + SaaS control plane)

```bash
cd server
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d   # MySQL 3315 + Redis 6390
npm install
npm run db:migrate
npm run seed                                     # platform + tenant + demo data
npm run dev                                      # http://localhost:5055
npm test
```

- API: `http://localhost:5055`
- SaaS UI (serve ໂດຍ server): `http://localhost:5055/`
- Health: `http://localhost:5055/health`
- ຖ້າ port 5055 ຖືກໃຊ້: `lsof -nP -iTCP:5055 -sTCP:LISTEN` ແລ້ວ kill
  ຫຼື `PORT=5056 npm run dev` (ຕ້ອງແກ້ `NUXT_PUBLIC_API_BASE` ຂອງ client ນຳ)

### 10.2 Client (Tenant App)

```bash
cd client
npm install
cp .env.example .env
npm run dev          # http://localhost:3000
```

Default ເຊື່ອມ API ຈິງ (`NUXT_PUBLIC_USE_MOCK=false`).
ຖ້າຕ້ອງການ UI offline ໃຫ້ຕັ້ງ `NUXT_PUBLIC_USE_MOCK=true`.
ຫຼັງແກ້ `nuxt.config.js` ຕ້ອງ restart dev server (runtimeConfig ບໍ່ hot-reload).

### 10.3 Admin (SaaS Console)

**ແບບ serve ຈາກ server (ແນະນຳ):**

```bash
cd server
npm run ui:build
npm run dev
# ເປີດ http://localhost:5055  → admin UI
```

**ແບບ dev ແຍກ:**

```bash
cd admin
npm install
cp .env.example .env
npm run dev -- --port 3001
# ເປີດ http://localhost:3001
```

### Ports

| ບໍລິການ | Port |
|---|---|
| API / Admin UI | `5055` |
| MySQL (dev) | `3315` |
| Redis (dev) | `6390` |
| Tenant App | `3000` |
| Admin dev ແຍກ | `3001` |

### ບັນຊີ dev ທີ່ seed ໃຫ້

| ບ່ອນ | Username / Email | Password |
|---|---|---|
| Platform console (superadmin) | `superadmin` | `sa123456` |
| Platform console (env) | `PLATFORM_ADMIN_EMAIL` / `PLATFORM_ADMIN_USERNAME` | `PLATFORM_ADMIN_PASSWORD` |
| Tenant `saiyfon` (admin) | `admin@saiyfon.com` | `Demo@1234` |
| Tenant (staff) | `staff@saiyfon.com` | `Demo@1234` |
| Tenant (agent) | `agent@saiyfon.com` | `Demo@1234` |
| Tenant (customer) | `customer@saiyfon.com` | `Demo@1234` |

> ບັນຊີເຫຼົ່ານີ້ເປັນ **dev/demo ເທົ່ານັ້ນ**. ກ່ອນ production ຕ້ອງປ່ຽນລະຫັດຜ່ານ ແລະ secret ທັງໝົດ.

### Seed scripts

| Script | ໜ້າທີ່ |
|---|---|
| `npm run seed` | platform admin + superadmin + default tenant + demo data (idempotent) |
| `npm run seed:all` | ແຍກລັນ platform → tenant → demo |
| `npm run seed:platform` | plans + platform admin + superadmin |
| `npm run seed:tenant` | default tenant + primary domain + tenant admin + demo users |
| `npm run seed:demo` | ຂໍ້ມູນທຸລະກິດຕົວຢ່າງ (ທີມ, ລູກຄ້າ, ປະກັນໄພ, ເຄມ, ໃບແຈ້ງໜີ້, ...) |

### Scripts ທີ່ສຳຄັນ

**server/**: `dev`, `build`, `start`, `typecheck`, `db:generate`, `db:migrate`, `db:push`,
`db:studio`, `test`, `ui:build`.

**client/**: `dev`, `build`, `generate`, `lint`, `format`, `test:unit`, `test:coverage`,
`test:e2e`, `check:tokens`, `cap:sync`, `cap:android`, `cap:ios`.

**admin/**: `dev`, `build`, `generate`, `preview`.

---

## 11. Environment Variables

### Server (`server/.env`)

| ຕົວແປ | ຄ່າເລີ່ມຕົ້ນ | ໝາຍເຫດ |
|---|---|---|
| `NODE_ENV` | `development` | `production` ເປີດການກວດເຂັ້ມງວດ |
| `PORT` | `5055` | API port |
| `DATABASE_URL` | `mysql://saiyfon:saiyfon@127.0.0.1:3315/saiyfon_insurance` | MySQL connection |
| `JWT_SECRET` | dev secret | ສຳລັບ tenant token (ຕ້ອງປ່ຽນໃນ production) |
| `PLATFORM_JWT_SECRET` | dev secret | ສຳລັບ platform token (ຄົນລະຕົວກັບ JWT_SECRET) |
| `REDIS_URL` | `redis://127.0.0.1:6390` | ວ່າງ = in-memory fallback (dev ເທົ່ານັ້ນ) |
| `ROOT_DOMAIN` | `saiyfon.app` | domain ຫຼັກ |
| `ADMIN_HOST` | `admin.saiyfon.app` | admin host |
| `CNAME_TARGET` | `cname.saiyfon.app` | CNAME ສຳລັບ custom domain |
| `CORS_EXTRA_ORIGINS` | localhost | origin ເພີ່ມເຕີມ (ນອກ tenant domain) |
| `CORS_ALLOW_ROOT_SUBDOMAINS` | `false` | ອະນຸຍາດທຸກ `*.ROOT_DOMAIN` ໂດຍບໍ່ກວດ verified (ບໍ່ແນະນຳ production) |
| `TLS_ASK_TOKEN` | `change-me` | token ສຳລັບ `/api/internal/tls/allow` |
| `ADMIN_DIST_PATH` | — | path ຂອງ admin build ຖ້າ serve ຈາກ server |
| `RUN_MIGRATIONS_ON_START` | `false` | legacy alias: ຕັ້ງ `true` ເທົ່າກັບ `DB_DOCTOR_MODE=repair` |
| `TRUST_PROXY` | `1` | ສຳລັບ reverse proxy |
| `PLATFORM_ADMIN_EMAIL` | `platform@saiyfon.com` | platform admin |
| `PLATFORM_ADMIN_USERNAME` | `platform` | platform username |
| `PLATFORM_ADMIN_PASSWORD` | — | platform password (seed / auto-bootstrap) |
| `PLATFORM_ADMIN_AUTO_SEED` | `true` | ສ້າງ/sync platform admin ອັດຕະໂນມັດຕອນ boot ຖ້າມີ password |
| `DEFAULT_TENANT_SLUG` | `saiyfon` | tenant ເລີ່ມຕົ້ນ |
| `DEFAULT_TENANT_NAME` | `ສາຍຝົນ ປະກັນໄພ` | ຊື່ tenant |
| `DEFAULT_TENANT_PLAN` | `pro` | ແຜນເລີ່ມຕົ້ນ |
| `DEFAULT_TENANT_ADMIN_EMAIL` | `admin@saiyfon.com` | tenant admin |
| `DEFAULT_TENANT_ADMIN_PASSWORD` | `Demo@1234` | tenant admin password |

> ຄ່າ tuning ບໍ່ຕ້ອງກຳນົດ ເວັ້ນຈຳເປັນ — code ມີ default ໃຫ້ແລ້ວ:
> `JWT_ISSUER=saiyfon`, `TENANT_TOKEN_TTL=1d`, `PLATFORM_TOKEN_TTL=8h`,
> `REDIS_KEY_PREFIX=saiyfon:`, `TENANT_CACHE_TTL_MS=60000`, `DB_POOL_SIZE=10`,
> `API_LEGACY_SUNSET` ແລະ `DRIZZLE_MIGRATIONS_DIR`.
>
> `DB_DOCTOR_*` ເປັນ optional overrides — ເບິ່ງລາຍລະອຽດຢູ່
> **[13.10 DB Doctor](#1310-db-doctor-database-health-check)**.

### Client (`client/.env`)

| ຕົວແປ | ຄ່າເລີ່ມຕົ້ນ | ໝາຍເຫດ |
|---|---|---|
| `NUXT_PUBLIC_USE_MOCK` | `false` | ໃຊ້ mock data ຫຼື API ຈິງ |
| `NUXT_PUBLIC_API_BASE` | `http://localhost:5055/api` | API base URL |
| `NUXT_PUBLIC_PLATFORM_URL` | `http://localhost:3001` | ປຸ່ມ “ກັບຄືນ Platform” ຕອນ impersonate |
| `NUXT_PUBLIC_TENANT_MODE` | `auto` | `auto` / `mock` / `off` |
| `NUXT_PUBLIC_DEFAULT_TENANT_SLUG` | `saiyfon` | tenant ເລີ່ມຕົ້ນ |
| `NUXT_PUBLIC_DEFAULT_TENANT_NAME` | `ສາຍຝົນ ປະກັນໄພ` | ຊື່ເລີ່ມຕົ້ນ |
| `NUXT_PUBLIC_DEFAULT_BRAND_COLOR` | `#047857` | ສີເລີ່ມຕົ້ນ |
| `NUXT_PUBLIC_MOCK_DELAY` | `450` | ທາງເລືອກ: ໜ່ວງເວລາ mock (ms) |
| `NUXT_PUBLIC_MOCK_FAILURE_RATE` | `0` | ທາງເລືອກ: ເປີເຊັນ mock error |

### Admin (`admin/.env`)

| ຕົວແປ | ຄ່າເລີ່ມຕົ້ນ | ໝາຍເຫດ |
|---|---|---|
| `NUXT_PUBLIC_API_BASE` | `/api` | same-origin ຫຼື absolute URL |
| `NUXT_PUBLIC_ROOT_DOMAIN` | `saiyfon.app` | root domain |

> `NUXT_PUBLIC_*` ຖືກ bake ຕອນ build ສຳລັບ SPA — ປ່ຽນຫຼັງ build ບໍ່ໄດ້.

---

## 12. ການທົດສອບ

```bash
# Server
cd server
npm test            # unit tests: JWT realm + validation
npm run typecheck

# Client
cd client
npm run lint
npm run format:check
npm run test:unit
npm run test:coverage
npm run test:e2e
npm run check:tokens
npm run build
```

- Server tests: 47 ເຄສ (JWT realm, validation, DB Doctor).
- Client unit tests: 89 ເຄສ (Vitest + Vue Test Utils).
- E2E: Playwright desktop + mobile, ກວດ 4 roles ແລະ ໜ້າຫຼັກ.
- a11y: axe-core (serious/critical = 0).
- token check: ກວດ hard-coded colors, `font-black`, `text-[10-11px]`, external assets, `console.log`.
- Coverage ຍັງຕ່ຳກວ່າເປົ້າໝາຍ 70% (baseline ປັດຈຸບັນ ~25.7% lines).

---

## 13. ການ Deploy

ຄູ່ມືນີ້ອະທິບາຍການ Deploy ດ້ວຍ **Dockerfile** ເທິງ **Coolify** ແບບ 2 ແອັບ
(API + Admin UI ເປັນໜຶ່ງ ແລະ Tenant App ເປັນອີກໜຶ່ງ) ພ້ອມ MySQL 8 ແລະ Redis 7.

> ຖ້າຕ້ອງການແຍກ **Admin** ແລະ **Client** ເປັນຄົນລະ app ໃຫ້ເບິ່ງ **13.9**.

### 13.1 ສະຖາປັດຕະຍະກຳການ Deploy

| # | ແອັບ | Dockerfile Location (relative to Base Directory) | Base Directory | Port | ໜ້າທີ່ | ຕົວຢ່າງ Domain |
|---|---|---|---|---|---|---|
| 1 | **API + Admin UI** | `/Dockerfile` | `/` | `5055` | Express API + SaaS Console | `admin.example.com` |
| 2 | **Tenant App** | `/Dockerfile` | `/client` | `80` | Nuxt SPA (Nginx static) | `*.app.example.com` (tenant ເລີ່ມຕົ້ນ `saiyfon.app.example.com`) |
| — | MySQL 8.4 | Coolify Database | — | `3306` | ຖານຂໍ້ມູນຫຼັກ | internal only |
| — | Redis 7 | Coolify Database | — | `6379` | cache + rate limit | internal only |

> **Dockerfile Location ເປັນ path ທີ່ອ້າງອີງຈາກ Base Directory ສະເໝີ.**
> ຕົວຢ່າງ Tenant App: Base `/client` + Location `/Dockerfile` = `/client/Dockerfile`.
> ຖ້າໃສ່ Location ເປັນ `/client/Dockerfile` ຈະກາຍເປັນ `/client/client/Dockerfile`
> ແລ້ວ deploy ຈະ fail ດ້ວຍ `lstat .../client/client: no such file or directory`.

> **ແນະນຳໃຫ້ໃຊ້ domain ແຍກຊັ້ນ:** `admin.example.com` ສຳລັບ API/Admin ແລະ
> `*.app.example.com` ສຳລັບ Tenant App ໂດຍຕັ້ງ `ROOT_DOMAIN=app.example.com`.
> Tenant ຈະຢູ່ໃນຮູບແບບ `<slug>.app.example.com` ເຊັ່ນ `saiyfon.app.example.com`.
> ຖ້າຕ້ອງການໃຫ້ `app.example.com` (apex) ໃຊ້ໄດ້ ໃຫ້ເພີ່ມເປັນ verified domain
> ຂອງ tenant ເລີ່ມຕົ້ນ ຫຼື ເຮັດ redirect ໄປ `saiyfon.app.example.com`.

```text
Internet
   │
   ├── admin.example.com ──────────────► [App 1: API 5055 + Admin UI]
   │                                        │
   ├── saiyfon.app.example.com ────────► [App 2: Tenant App 80]
   ├── acme.app.example.com ───────────► [App 2: Tenant App 80]
   │
   └── custom customer domain ─────────► [App 2: Tenant App 80]
                                            │
                                            └── XHR ──► admin.example.com/api
```

### 13.2 DNS ທີ່ຕ້ອງກຽມ

| Record | Name | Value | ໝາຍເຫດ |
|---|---|---|---|
| `A` | `admin.example.com` | Server IP | API + Admin UI |
| `A` | `*.app.example.com` | Server IP | ທຸກ tenant ແບບ `<slug>.app.example.com` |
| `A` (optional) | `app.example.com` | Server IP | apex ໃຊ້ກັບ redirect/landing ເທົ່ານັ້ນ |
| `CNAME` ຫຼື `A` | `cname.app.example.com` | `app.example.com` ຫຼື Server IP | ໃຫ້ລູກຄ້າ CNAME ມາ |
| `TXT` | `_saiyfon-verify.<custom-domain>` | `saiyfon-verify=<token>` | ສ້າງຈາກ SaaS Console ຕອນເພີ່ມ custom domain |

- ຖ້າໃຊ້ Cloudflare ໃຫ້ເປີດ Proxy ສຳລັບ `admin` ແລະ `app` ໄດ້
  ແຕ່ຕ້ອງຕັ້ງ SSL mode ເປັນ **Full (strict)**.
- Wildcard `*.app.example.com` ຕ້ອງການ DNS-01 challenge ສຳລັບ TLS.
  ຖ້າ Coolify ຂອງທ່ານບໍ່ຮອງຮັບ wildcard certificate ໃຫ້ເພີ່ມແຕ່ລະ subdomain
  ເຂົ້າໃນ App 2 ຫຼື ໃຊ້ reverse proxy/Cloudflare ທີ່ຈັດ wildcard TLS.

### 13.3 ສ້າງ MySQL ແລະ Redis ໃນ Coolify

1. ໃນ Coolify ເລືອກ **Project → + New Resource → Database → MySQL**.
2. ຕັ້ງ version ເປັນ **MySQL 8.x**, ເປີດ **Persistent Storage** ສຳລັບ `/var/lib/mysql`.
3. ສ້າງ database ຊື່ `saiyfon_insurance` ແລະ user ສະເພາະ (ບໍ່ໃຊ້ root).
4. ສ້າງ **Redis 7** ເປີດ **Persistent Storage** ສຳລັບ `/data` ແລະ ຖ້າເປັນໄປໄດ້
   ໃສ່ password (`requirepass`) ແລ້ວນຳໄປໃສ່ `REDIS_URL`.
5. ໃຫ້ App 1 ຢູ່ **Project/Network ດຽວກັນ** ກັບ MySQL/Redis ເພື່ອໃຊ້ internal hostname.

ຕົວຢ່າງ connection string (ແທນ host/password ດ້ວຍຄ່າຈິງຈາກ Coolify):

```bash
# ແບບ Coolify internal network (ແນະນຳ — ບໍ່ອອກ internet)
DATABASE_URL=mysql://saiyfon_user:StrongPassw0rd@mysql-service-name:3306/saiyfon_insurance
REDIS_URL=redis://default:StrongPassw0rd@redis-service-name:6379/0

# ແບບ external/managed database (ຕົວຢ່າງ)
DATABASE_URL=mysql://saiyfon_user:StrongPassw0rd@db.example.com:3306/saiyfon_insurance
REDIS_URL=rediss://default:StrongPassw0rd@redis.example.com:6379/0
```

> Password ທີ່ມີອັກສອນພິເສດ (`@`, `:`, `/`, `#`) ຕ້ອງ encode ໃນ URL
> ຕົວຢ່າງ `P@ss#1` → `P%40ss%231`. ຢ່າໃຊ້ `localhost` ໃນ Coolify ຖ້າ DB
> ຢູ່ຄົນລະ container — ໃຫ້ໃຊ້ internal service name ຫຼື external hostname.

ສ້າງ secret ດ້ວຍ:

```bash
openssl rand -hex 32   # JWT_SECRET
openssl rand -hex 32   # PLATFORM_JWT_SECRET
openssl rand -hex 32   # TLS_ASK_TOKEN
```

### 13.4 App 1 — API + Admin UI (Root Dockerfile)

#### ຕັ້ງຄ່າ Resource

| ຊ່ອງ | ຄ່າ |
|---|---|
| Source | Git repository ຂອງໂປຣເຈັກ |
| Build Pack | **Dockerfile** |
| Base Directory | `/` |
| Dockerfile Location | `/Dockerfile` |
| Exposed Port | `5055` |
| Healthcheck Path | `/health` |
| Domain | `https://admin.example.com` |
| Persistent Storage | Volume ທີ່ mount ໄປ `/app/uploads` |
| Watch Paths | `server/**`, `admin/**`, `Dockerfile` (ຖ້າມີ) |

> Root `Dockerfile` build ທັງ `server/` ແລະ `admin/` ແລ້ວ serve admin UI ຢູ່ `/`
> ພາຍໃຕ້ origin ດຽວກັນ. ບໍ່ຕ້ອງ Deploy admin ແຍກຖ້າໃຊ້ແບບນີ້.

#### Build Arguments

| Build Arg | ຄ່າຕົວຢ່າງ | ໝາຍເຫດ |
|---|---|---|
| `NUXT_PUBLIC_API_BASE` | `/api` | Admin ເອີ້ນ API same-origin |
| `NUXT_PUBLIC_ROOT_DOMAIN` | `app.example.com` | ຕ້ອງກົງກັບ server `ROOT_DOMAIN` |

#### Environment Variables

**ຈຳເປັນຂັ້ນຕ່ຳ (4 ຕົວ):**

| ຕົວແປ | ຄ່າຕົວຢ່າງ | ໝາຍເຫດ |
|---|---|---|
| `NODE_ENV` | `production` | ເປີດການກວດເຂັ້ມງວດ ແລະ ບັງຄັບ JWT secret |
| `DATABASE_URL` | `mysql://saiyfon_user:StrongPassw0rd@mysql-service-name:3306/saiyfon_insurance` | MySQL internal URL ຈາກ Coolify; ແທນ password/host ດ້ວຍຄ່າຈິງ |
| `JWT_SECRET` | random 32-byte hex | tenant realm |
| `PLATFORM_JWT_SECRET` | random 32-byte hex | platform realm (ຕ່າງຈາກ `JWT_SECRET`) |

**ແນະນຳ / ອີງຕາມ topology:**

| ຕົວແປ | ຄ່າຕົວຢ່າງ | ໝາຍເຫດ |
|---|---|---|
| `PORT` | `5055` | default `5055` |
| `REDIS_URL` | `redis://default:StrongPassw0rd@redis-service-name:6379/0` | Redis internal URL ຈາກ Coolify; ຖ້າບໍ່ຕັ້ງ = in-memory (ບໍ່ແນະນຳ production) |
| `ROOT_DOMAIN` | `app.example.com` | ຕ້ອງກົງກັບ tenant domain |
| `ADMIN_HOST` | `admin.example.com` | admin + CORS allowlist |
| `CNAME_TARGET` | `cname.app.example.com` | CNAME ສຳລັບ custom domain |
| `CORS_EXTRA_ORIGINS` | `https://saiyfon.app.example.com` | origin ເພີ່ມເຕີມ, comma-separated |
| `CORS_ALLOW_ROOT_SUBDOMAINS` | `false` | ເປີດສະເພາະກໍລະນີພິເສດ; ປົກກະຕິໃຫ້ອະນຸຍາດສະເພາະ verified tenant domains |
| `TLS_ASK_TOKEN` | random 32-byte hex | `/api/internal/tls/allow` |
| `TRUST_PROXY` | `1` | ຫຼັງ reverse proxy |
| `ADMIN_DIST_PATH` | `/app/admin` | Dockerfile ຕັ້ງໃຫ້ແລ້ວ |

**Seed / bootstrap (ຄັ້ງທຳອິດ):**

| ຕົວແປ | ຄ່າຕົວຢ່າງ | ໝາຍເຫດ |
|---|---|---|
| `PLATFORM_ADMIN_EMAIL` | `platform@example.com` | |
| `PLATFORM_ADMIN_USERNAME` | `platform` | |
| `PLATFORM_ADMIN_PASSWORD` | **strong password** | ໃຊ້ຕອນ seed / auto-bootstrap |
| `PLATFORM_ADMIN_AUTO_SEED` | `true` | ຖ້າ `false` ຕ້ອງ seed ດ້ວຍມື |
| `DEFAULT_TENANT_SLUG` | `saiyfon` | |
| `DEFAULT_TENANT_NAME` | `ສາຍຝົນ ປະກັນໄພ` | |
| `DEFAULT_TENANT_PLAN` | `pro` | |
| `DEFAULT_TENANT_ADMIN_EMAIL` | `admin@example.com` | |
| `DEFAULT_TENANT_ADMIN_PASSWORD` | **strong password** | ໃຊ້ຕອນ seed |

> **Migration:** ໃນ production, `DB_DOCTOR_MODE` default ເປັນ `repair` ແລ້ວ
> (apply pending migration + additive repair ກ່ອນ `server.listen()`).
> ຖ້າຕ້ອງການ override ເບິ່ງ **[13.10](#1310-db-doctor-database-health-check)**.
> `RUN_MIGRATIONS_ON_START` ຍັງຮອງຮັບເພື່ອ backward compatibility ແຕ່ບໍ່ຈຳເປັນໃຊ້ແລ້ວ.
>
> ຄ່າ tuning ອື່ນ (`JWT_ISSUER`, token TTLs, `REDIS_KEY_PREFIX`,
> `TENANT_CACHE_TTL_MS`, `DB_POOL_SIZE`) ມີ default ໃນ code ແລ້ວ — ຕັ້ງສະເພາະເມື່ອຈຳເປັນ.

> ຢ່າ commit `.env` ຫຼື secret ລົງ Git. ໃສ່ໃນ Coolify Environment Variables ເທົ່ານັ້ນ.

#### ຂັ້ນຕອນ Deploy App 1

1. **+ New Resource → Application → Git repository** ແລ້ວເລືອກ build pack `Dockerfile`.
2. ຕັ້ງ **Base Directory = `/`**, **Dockerfile = `/Dockerfile`**, **Port = `5055`**.
3. ໃສ່ Build Args ແລະ Environment Variables ຕາມຕາຕະລາງຂ້າງເທິງ.
4. ເພີ່ມ **Persistent Storage**:
   - Name: `uploads`
   - Mount Path: `/app/uploads`
   - ຂະໜາດຕາມ plan (ເອກະສານເຄມ/ບັດປະຊາຊົນ/ສະລິບ).
5. ກົດ **Deploy**. ໃນ production, DB Doctor (`DB_DOCTOR_MODE=repair` default) ຈະ apply
   pending migration ແລະ additive repair ກ່ອນ server ເລີ່ມ — ເບິ່ງ logs `[db-doctor]`.
6. **Platform admin ຖືກ bootstrap ອັດຕະໂນມັດ** ຕອນ server ເລີ່ມ ຖ້າ
   `PLATFORM_ADMIN_PASSWORD` ຖືກຕັ້ງ (≥ 8 ໂຕ) ແລະ `PLATFORM_ADMIN_AUTO_SEED` ບໍ່ແມ່ນ `false`.
   ເບິ່ງ log `[bootstrap] created/updated platform admin`.
   ຖ້າຕ້ອງການ tenant ເລີ່ມຕົ້ນ ຫຼື ປິດ auto-seed ໃຫ້ seed ດ້ວຍມືຜ່ານ
   **Coolify → Terminal** ຂອງ container:

```bash
# production ແນະນຳ: seed ແຕ່ tenant, ບໍ່ seed demo
node dist/scripts/seed-tenant.js

# staging/dev ຖ້າຕ້ອງການຂໍ້ມູນຕົວຢ່າງ
node dist/scripts/seed-demo.js
```

> `node dist/scripts/seed-platform.js` ຈະສ້າງ `superadmin/sa123456` ນຳ — ຫຼີກລ່ຽງໃນ production.

7. ກວດ health ແລະ admin UI:

```bash
curl -fsS https://admin.example.com/health
curl -fsS https://admin.example.com/api/health
```

8. ເປີດ `https://admin.example.com/login` ແລ້ວ login ດ້ວຍ platform admin ທີ່ seed.
9. ແລ້ວໄປສ້າງ/ກວດ tenant, plan, domain ໃນ SaaS Console.

> **ທຸກຄັ້ງທີ່ແກ້ `admin/` ຫຼື `server/`** ໃຫ້ Redeploy App 1.
> ການແກ້ Build Args ຂອງ admin ຕ້ອງ **Rebuild**, ບໍ່ແມ່ນ restart.

### 13.5 App 2 — Tenant App (Client Dockerfile)

Tenant App ເປັນ SPA static ທີ່ build ດ້ວຍ `npm run generate` ແລ້ວ serve ດ້ວຍ Nginx
(`client/Dockerfile` + `client/nginx.conf`). ບໍ່ມີ server runtime ແລະ ບໍ່ຕ້ອງການ env ຕອນ runtime.

#### ຕັ້ງຄ່າ Resource

| ຊ່ອງ | ຄ່າ |
|---|---|
| Build Pack | **Dockerfile** |
| Base Directory | `/client` |
| Dockerfile Location | `/Dockerfile` (relative to Base Directory — **ຢ່າ** ໃສ່ `/client/Dockerfile`) |
| Exposed Port | `80` |
| Healthcheck Path | `/health` |
| Domains | `https://*.app.example.com` (ແລະ `https://saiyfon.app.example.com` ຖ້າ UI ຕ້ອງການ non-wildcard) |
| Persistent Storage | ບໍ່ຕ້ອງການ |
| Watch Paths | `client/**` |

#### Build Arguments (ຄົງທີ່ຕອນ Build)

| Build Arg | ຄ່າຕົວຢ່າງ | ໝາຍເຫດ |
|---|---|---|
| `NUXT_PUBLIC_API_BASE` | `https://admin.example.com/api` | ຕ້ອງເປັນ HTTPS absolute URL |
| `NUXT_PUBLIC_PLATFORM_URL` | `https://admin.example.com` | ປຸ່ມ “ກັບຄືນ Platform” ຕອນ impersonate |
| `NUXT_PUBLIC_USE_MOCK` | `false` | production ຕ້ອງ false |
| `NUXT_PUBLIC_TENANT_MODE` | `auto` | resolve tenant ຈາກ Host |
| `NUXT_PUBLIC_DEFAULT_TENANT_SLUG` | `saiyfon` | fallback ສຳລັບ localhost/dev |
| `NUXT_PUBLIC_DEFAULT_TENANT_NAME` | `ສາຍຝົນ ປະກັນໄພ` | branding fallback |
| `NUXT_PUBLIC_DEFAULT_BRAND_COLOR` | `#047857` | ສີ fallback |

> **ສຳຄັນ:** `NUXT_PUBLIC_*` ຖືກ bake ໃສ່ SPA ຕອນ build. ຖ້າແກ້ API URL ຫຼື domain
> ຕ້ອງ **Rebuild + Redeploy** App 2, ບໍ່ສາມາດແກ້ດ້ວຍ restart ຫຼື env runtime ໄດ້.
>
> ບໍ່ຕ້ອງຕັ້ງ root domain ຝັ່ງ client — tenant ຖືກ resolve ຈາກ `Host`
> (ຫຼື `X-Tenant` ໃນ mobile) ຕາມພາກ 9.

#### ຂັ້ນຕອນ Deploy App 2

1. **+ New Resource → Application** ຈາກ Git repository ດຽວກັນ.
2. ເລືອກ **Build Pack = Dockerfile**, **Base Directory = `/client`**,
   **Dockerfile Location = `/Dockerfile`** (ບໍ່ແມ່ນ `/client/Dockerfile`).
3. ຕັ້ງ **Port = `80`** ແລະ **Healthcheck Path = `/health`**.
4. ໃສ່ Build Args ຕາມຕາຕະລາງ.
5. ເພີ່ມ Domains:
   - `https://*.app.example.com`
   - `https://saiyfon.app.example.com` (default tenant)
   ຖ້າ Coolify ບໍ່ຮອງຮັບ wildcard TLS ໃຫ້ເພີ່ມ subdomain ຂອງແຕ່ລະ tenant ແຍກ.
6. ກົດ **Deploy** ແລ້ວກວດ:

```bash
curl -fsS https://saiyfon.app.example.com/health
curl -I https://saiyfon.app.example.com
curl -I https://acme.app.example.com
```

7. ເປີດ `https://saiyfon.app.example.com` ຄວນໂຫຼດ branding ຂອງ tenant `saiyfon`
   ແລະ login ໄດ້. ຖ້າໄປ `/tenant-not-found` ໃຫ້ກວດ DNS/Host ແລະ domain ໃນ SaaS Console.

### 13.6 Custom Domain ຂອງລູກຄ້າ

1. ໃນ **SaaS Console → Tenant detail → Domains** ເພີ່ມ domain ເຊັ່ນ `insurance.customer.com`.
2. ລູກຄ້າຕັ້ງ DNS:
   - `CNAME insurance.customer.com → cname.app.example.com`
   - `TXT _saiyfon-verify.insurance.customer.com = saiyfon-verify=<token>`
3. ກົດ **Verify** ໃນ Console ຈົນສະຖານະ verified.
4. ເພີ່ມ domain ນັ້ນເຂົ້າ **Domains ຂອງ App 2 ໃນ Coolify** ດ້ວຍ
   (ຫຼື ໃຊ້ edge proxy/wildcard ທີ່ຮັບ custom domain ທັງໝົດສົ່ງມາ App 2).
5. ຫຼັງ verify ແລ້ວ server ຈະອະນຸຍາດ CORS ຂອງ hostname ນັ້ນອັດຕະໂນມັດ.

### 13.7 ການກວດສອບຫຼັງ Deploy

```bash
# API + Admin
curl -fsS https://admin.example.com/health
curl -fsS https://admin.example.com/api/health
curl -fsS "https://admin.example.com/api/public/tenant?slug=saiyfon"
curl -I https://admin.example.com/login

# Tenant App
curl -fsS https://saiyfon.app.example.com/health
curl -I https://saiyfon.app.example.com
curl -I https://acme.app.example.com

# CORS: ຄວນເຫັນ access-control-allow-origin ຂອງ app domain
curl -i -X OPTIONS https://admin.example.com/api/public/tenant \
  -H "Origin: https://saiyfon.app.example.com" \
  -H "Access-Control-Request-Method: GET"
```

Checklist:

- [ ] `https://admin.example.com/login` ໂຫຼດ ແລະ login platform ໄດ້
- [ ] ສ້າງ/ເບິ່ງ tenant ໃນ SaaS Console ໄດ້
- [ ] `https://saiyfon.app.example.com` ໂຫຼດ tenant branding ຖືກ
- [ ] Tenant admin login ໄດ້ ແລະ API ຕອບ 200
- [ ] ອັບໂຫຼດເອກະສານເຄມໄດ້ ແລະ ດາວໂຫຼດຄືນໄດ້ (ຫຼັງ restart ໄຟລ໌ຍັງຢູ່)
- [ ] logs `[db-doctor]` ບໍ່ມີ critical / ບໍ່ exit 1
- [ ] ບໍ່ມີ CORS error ໃນ browser console

### 13.8 Troubleshooting

| ອາການ | ສາເຫດທີ່ພົບເລື້ອຍ | ວິທີແກ້ |
|---|---|---|
| Build fail: `resolve : lstat .../client/client: no such file or directory` | Dockerfile Location ຖືກໃສ່ຊ້ຳກັບ Base Directory (ເຊັ່ນ Base `/client` + Location `/client/Dockerfile`) | ຕັ້ງ Base Directory `/client`, Dockerfile Location `/Dockerfile` ແລ້ວ Redeploy |
| API 502 / container restart | `DATABASE_URL` ຜິດ, DB ບໍ່ພ້ອມ, port ຜິດ | ເບິ່ງ logs, ກວດ internal hostname/port, ລອງ `curl` ຈາກ terminal |
| `ER_ACCESS_DENIED_ERROR` | user/password DB ຜິດ ຫຼື host ບໍ່ allow | ສ້າງ user ໃໝ່ດ້ວຍ host `%` ໃນ MySQL |
| ໜ້າ Admin ຂຶ້ນແຕ່ API error | Build arg `NUXT_PUBLIC_API_BASE` ຜິດ | ຕ້ອງ `/api` ແລ້ວ **Rebuild** App 1 |
| CORS error / `Failed to fetch` ໃນ Tenant App | origin ບໍ່ຢູ່ໃນ allowlist — custom domain ຍັງບໍ່ verified | Domain ໃນ Console → Verify (TXT `_saiyfon-verify.<host>`) ຫຼື ເພີ່ມ `CORS_EXTRA_ORIGINS` ຊົ່ວຄາວ; ຫຼັງ verify ບໍ່ຕ້ອງ restart |
| `/tenant-not-found` ທັງທີ່ domain ຖືກຕ້ອງ | API ຢູ່ຄົນລະ domain ແລ້ວ resolve ຈາກ `Host` ຂອງ API | ອັບເດດ server ໃຫ້ resolve ຈາກ `Origin`/`X-Tenant-Host`/`?host=` (ແກ້ແລ້ວ) ແລ້ວ Redeploy API |
| `/tenant-not-found` | Host ບໍ່ກົງກັບ tenant domain | ກວດ DNS, domain ໃນ Console, `ROOT_DOMAIN` ແລະ Host header |
| ຂຶ້ນ `/select-company` | mobile ບໍ່ມີ slug ທີ່ບັນທຶກ | ເລືອກບໍລິສັດ ຫຼື ກວດ `X-Tenant`/API |
| ອັບໂຫຼດໄຟລ໌ໄດ້ແຕ່ຫາຍຫຼັງ restart | ບໍ່ໄດ້ mount volume | mount `/app/uploads` ໃຫ້ App 1 |
| ອັບໂຫຼດ EACCES / permission denied | volume ເປັນຂອງ root | ໃນ container: `chown -R 100:101 /app/uploads` |
| 413 Payload Too Large | proxy/API limit ຕ່ຳ | API ຮັບ 10 MB; ກວດ reverse proxy body limit |
| ແກ້ env ແລ້ວ Tenant App ບໍ່ປ່ຽນ | `NUXT_PUBLIC_*` ຖືກ bake ຕອນ build | **Rebuild** App 2 |
| Wildcard domain ບໍ່ມີ TLS | ບໍ່ມີ DNS-01/wildcard cert | ໃຊ້ DNS challenge ຫຼື ເພີ່ມ subdomain ແຍກ |
| `dist/scripts/seed-*.js` ບໍ່ພົບ | seed ຈາກ image ເກົ່າ/working dir ຜິດ | ໃຫ້ແນ່ໃຈວ່າ deploy image ໃໝ່ ແລະ ຢູ່ `/app` |

### 13.9 ທາງເລືອກ: ແຍກ 3 ແອັບ (API / Admin / Client)

ຖ້າບໍ່ຕ້ອງການໃຫ້ API serve Admin UI ສາມາດແຍກໄດ້:

| ແອັບ | Dockerfile Location (relative to Base Directory) | Base Directory | Port | ໝາຍເຫດ |
|---|---|---|---|---|
| API | `/Dockerfile` | `/server` | `5055` | API ຢ່າງດຽວ |
| Admin | `/Dockerfile` | `/admin` | `80` | ຕັ້ງ `NUXT_PUBLIC_API_BASE=https://api.example.com/api` |
| Client | `/Dockerfile` | `/client` | `80` | ຄືແບບ 13.5 (ບໍ່ຕ້ອງ root domain) |

- Admin build args: `NUXT_PUBLIC_API_BASE` ເປັນ absolute URL ໄປຫາ API ແລະ
  `NUXT_PUBLIC_ROOT_DOMAIN` ໃຫ້ກົງກັບ server `ROOT_DOMAIN`.
- Server env: ຕັ້ງ `ADMIN_HOST` ໃຫ້ກົງກັບ domain ຂອງ Admin ເພື່ອໃຫ້ CORS ຜ່ານ.
- ຖ້າ Admin ຢູ່ domain ອື່ນ ໃຫ້ເພີ່ມ domain ນັ້ນໃນ `CORS_EXTRA_ORIGINS`.

### 13.10 DB Doctor (Database Health Check)

DB Doctor ຈະລັນ **ກ່ອນ server.listen()** ທຸກຄັ້ງທີ່ container ເລີ່ມ (ທຸກ deploy/restart)
ເມື່ອ `DB_DOCTOR_MODE` ບໍ່ແມ່ນ `off`:

1. ກວດ connection, MySQL version, charset/collation
2. ກວດ migration ທີ່ pending, hash mismatch, migration ຂາດ ຫຼື out-of-order
3. ຖ້າ mode = `repair` ຈະ apply migration ທີ່ pending ພາຍໃຕ້ MySQL advisory lock
4. ກວດ schema ຕົວຈິງທຽບກັບ Drizzle schema (tables/columns/indexes/FKs)
5. Repair additive ທີ່ປອດໄພ: ເພີ່ມ column/index/FK ທີ່ຂາດ (ບໍ່ drop/modify/delete)
6. ກວດ data integrity: orphan, tenant_id ຫວ່າງ, status, ຍອດຕິດລົບ, ວັນທີ
7. ບັນທຶກຜົນລົງ `db_doctor_runs`

```bash
# ກວດຢ່າງດຽວ (ບໍ່ແກ້)
npm run db:doctor

# apply migration + repair additive
npm run db:doctor:repair

# ກວດເລິກ + JSON
npm run db:doctor -- --deep --json

# ໃນ container production
node dist/scripts/db-doctor.js --mode repair
```

**ການຕັ້ງຄ່າໃນ Coolify (App 1):**

ຄ່າເຫຼົ່ານີ້ **ບໍ່ຈຳເປັນ** ໃນ production ເພາະ default ເປັນ `repair` ແລ້ວ —
ຕັ້ງສະເພາະເມື່ອຕ້ອງການປັບພຶດຕິກຳ:

```env
DB_DOCTOR_MODE=repair          # off | report | check | repair (default: repair ໃນ production)
DB_DOCTOR_FAIL_ON=critical     # critical | warning | never
DB_DOCTOR_DATA_CHECKS=true     # false | true | deep
DB_DOCTOR_LOCK_TIMEOUT_MS=45000
DB_DOCTOR_DATA_BUDGET_MS=15000
DB_DOCTOR_AUDIT=true
```

| Mode | ພຶດຕິກຳ |
|---|---|
| `off` | ຂ້າມ DB Doctor |
| `report` | ກວດ + log, ບໍ່ແກ້ |
| `check` | ກວດເຂັ້ມງວດ, ບໍ່ແກ້ |
| `repair` | apply pending migration + additive repair |

- ຖ້າເຈີ critical (schema/migration ຜິດ) → doctor ຈະ `exit 1` ແລະ Coolify ຈະຖືວ່າ deploy ລົ້ມເຫຼວ
- ຖ້າເຈີ warning ຢ່າງດຽວ → server ຈະເລີ່ມໄດ້ ແລະ log ລາຍລະອຽດ
- ບໍ່ auto-delete ຫຼື ແກ້ business data; ຂໍ້ມູນຜິດຈະຖືກລາຍງານໃຫ້ແກ້ດ້ວຍມື
- Deploy ທຳອິດອາດໃຊ້ເວລາ migrate/ກວດດົນກວ່າ; Docker healthcheck ຕັ້ງ start-period 60s ແລ້ວ
- Docker build ຈະລັນ `db:check:static` ເພື່ອກັນ schema ປ່ຽນແຕ່ລືມ `npm run db:generate`

### 13.11 Backup ແລະ ຄວາມປອດໄພຕອນ Deploy

- ເປີດ backup MySQL ອັດຕະໂນມັດ ຫຼື `mysqldump` ປະຈຳວັນ.
- Backup volume `/app/uploads` (ເອກະສານເຄມ/ບັດປະຊາຊົນ/ສະລິບ).
- ປ່ຽນ password ທັງໝົດທີ່ເປັນ default (`Demo@1234`, `ChangeMe123!`, `sa123456`).
- ຢ່າ run `seed-demo` ໃນ production.
- ຕັ້ງ `NODE_ENV=production`, `TRUST_PROXY=1` ແລະໃຊ້ HTTPS ທຸກ domain.
- ຈຳກັດສິດເຂົ້າ Coolify ແລະ rotate JWT secret ຫາກ suspect.

## 14. ຄວາມປອດໄພ

- **CORS allowlist**: admin host, exact root domain, **verified tenant domains** (from `tenant_domains`), `CORS_EXTRA_ORIGINS`;
  `CORS_ALLOW_ROOT_SUBDOMAINS=false` ເປັນ default ເພື່ອບໍ່ອະນຸຍາດ subdomain ທີ່ຍັງບໍ່ verified; dev ອະນຸຍາດ localhost ທຸກ port.
  ຖ້າ upgrade ຈາກລະບົບເກົ່າທີ່ມີ subdomain ແຕ່ຍັງບໍ່ມີໃນ `tenant_domains` ໃຫ້ backfill
  ກ່ອນ deploy ຫຼື ຕັ້ງ `CORS_ALLOW_ROOT_SUBDOMAINS=true` ຊົ່ວຄາວ.
- **Rate limit** (Redis-backed):
  - tenant login 100 ຄັ້ງ / 15 ນາທີ
  - tenant register 30 ຄັ້ງ / 15 ນາທີ
  - platform login 30 ຄັ້ງ / 15 ນາທີ
- **Plan limits**: `maxUsers`, `maxPolicies` (0 = ບໍ່ຈຳກັດ) → 403 `plan_limit_reached`.
- **JWT 2 realm**: token tenant ໃຊ້ກັບ platform ບໍ່ໄດ້ ແລະ token ຂອງ tenant ໜຶ່ງ
  ຈະຖືກປະຕິເສດຖ້າສົ່ງມາກັບ Host/`X-Tenant` ຂອງ tenant ອື່ນ.
- **Tenant scoping**: ທຸກ query ທຸລະກິດ scope ດ້ວຍ `tenant_id`.
- **Audit log**: ບັນທຶກ create/update/suspend/delete/domain/impersonate ຂອງ platform.
- **Soft delete**: ລຶບ tenant ແບບ soft-delete ແລະ ປ່ອຍ slug/domain ໃຫ້ໃຊ້ຄືນໄດ້.
- **Secrets**: ຫ້າມ commit `.env`, ຫ້າມ log token/password.
- **ຍັງບໍ່ມີ**: MFA, billing, per-agent row scoping, server integration tests.

---

## 15. ເອກະສານ ແລະ ສະຖານະ

### ເອກະສານລາຍລະອຽດ

| ໄຟລ໌ | ເນື້ອໃນ |
|---|---|
| `server/README.md` | API, multi-tenant, schema, deployment, Caddy |
| `admin/README.md` | SaaS console, static deploy, security notes |
| `client/README.md` | Tenant app, scripts, conventions, Capacitor |
| `client/docs/glossary.md` | ຄຳສັບລາວມາດຕະຖານ |
| `client/docs/api-contract.md` | ສັນຍາ API/mock, entities |
| `client/docs/page-recipe.md` | Checklist ສຳລັບໜ້າໃໝ່ |
| `client/docs/DEVELOPMENT_PLAN.md` | ແຜນພັດທະນາເດີມ |
| `client/docs/IMPLEMENTATION_STATUS.md` | ສະຖານະການປະຕິບັດ ແລະ ວຽກຕໍ່ |
| `server/docs/api-routes.md` | ລາຍລະອຽດ API routes |
| `Project.txt` | Requirement ເດີມ (Laravel-era prompts) |

### ສະຖານະປັດຈຸບັນ

| ລາຍການ | ສະຖານະ |
|---|---|
| Multi-tenant schema + platform API + Redis | ສຳເລັດ |
| Admin console + static deploy | ສຳເລັດ |
| Client tenant bootstrap + branding + guards | ສຳເລັດ |
| API ທຸລະກິດຈິງ (policies/customers/agents/teams/claims/quotations/commissions/invoices/payments/dashboard) | ສຳເລັດ |
| Real-mode E2E 4 roles + ໜ້າຫຼັກ | ສຳເລັດ (0 error) |
| Rate limit + plan limits + server unit tests | ສຳເລັດ |
| Capacitor sync | ສຳເລັດ |
| Capacitor device test (iOS/Android) | ຍັງຄ້າງ |
| Coverage 70% | ຍັງບໍ່ຮອດ (~25.7%) |
| MFA / billing / per-agent row scoping | ຍັງບໍ່ມີ |

**ຂໍ້ຈຳກັດທີ່ຮູ້:**
- ຟອມຫຼັກ (ລູກຄ້າ, ຕົວແທນ, ທີມ, invoice, payment, profile, ອັບໂຫຼດເອກະສານ) ເຊື່ອມ API ຈິງແລ້ວ; ການຈັດການຜູ້ໃຊ້ ແລະ ບາງໜ້າຮອງຍັງເປັນ toast/placeholder.
- Settings ເປັນ UI placeholder ບາງສ່ວນ; ຍັງບໍ່ໄດ້ເຊື່ອມ CRUD ຄົບ.
- i18n ໃຊ້ຄຳສັບລາວຜ່ານ glossary ແລະ `useT()` ເທົ່ານັ້ນ ຍັງບໍ່ໄດ້ຕິດ `@nuxtjs/i18n`.
- System Health ໃນ admin ຍັງເປັນຂໍ້ມູນ static/mock.

### ຂໍ້ຄວນຮູ້ສຳລັບການພັດທະນາ

- ໃຊ້ `definePageMeta({ layout, title, permission })` ໃນທຸກໜ້າ; ຫ້າມຫໍ່ `<NuxtLayout>` ໃນ page.
- ຂໍ້ມູນຕ້ອງຜ່ານ composable `useXxx()`; ຫ້າມ hard-code array ໃນ page.
- ສີ/typography ໃຊ້ design token; ຫ້າມສີ Tailwind ດິບ, `font-black`, `text-[10px]`, `text-[11px]`.
- ຫ້າມ external asset/CDN; ຮູບທັງໝົດຢູ່ `client/app/assets/img` ຫຼື `public/`.
- ເງິນ/ວັນທີ/ເບີໂທ ຜ່ານ `useFormat()`; ຂໍ້ຄວາມ UI ຜ່ານ glossary ຫຼື `useT()`.
- ບໍ່ມີ `console.log`, secret ຫຼື credential ໃນ log/ໂຄດ.
