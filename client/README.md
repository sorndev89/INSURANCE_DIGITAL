# Saiyfon Insurance Digital — Client

Frontend ຂອງລະບົບຄຸ້ມຄອງການປະກັນໄພ ສາຍຝົນ ປະກັນໄພ. ຮອບນີ້ເຮັດດ້ວຍ **Mock Data** ແລະ ຍັງບໍ່ເຊື່ອມ API ຈິງ.

## Stack

| ສ່ວນ      | ເຕັກໂນໂລຢີ                                                |
| --------- | --------------------------------------------------------- |
| Framework | Nuxt 4.3 (`ssr: false`), Vue 3.5                          |
| State     | Pinia                                                     |
| CSS       | Tailwind CSS 4 + `@theme` tokens                          |
| Mobile UI | Konsta UI (mobile layout ເທົ່ານັ້ນ)                       |
| Device    | `@vueuse/nuxt` (breakpoints), `@nuxtjs/device` (platform) |
| Native    | Capacitor 8                                               |
| Test      | Vitest + Vue Test Utils, Playwright + axe                 |

## Requirements

- Node.js 22 LTS ຫຼືໃໝ່ກວ່າ
- npm 10+

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

ເປີດ `http://localhost:3000`.

## Scripts

| Script                            | ໜ້າທີ່                         |
| --------------------------------- | ------------------------------ |
| `npm run dev`                     | ເປີດ dev server                |
| `npm run build`                   | build production               |
| `npm run generate`                | generate SPA ສຳລັບ Capacitor   |
| `npm run lint`                    | ESLint ສຳລັບ code ໃໝ່          |
| `npm run lint:all`                | ESLint ທັງໂປຣເຈັກ (ລວມ legacy) |
| `npm run format`                  | Prettier code ໃໝ່              |
| `npm run test:unit`               | unit test                      |
| `npm run test:coverage`           | unit test + coverage           |
| `npm run test:e2e`                | Playwright                     |
| `npm run check:tokens`            | ກວດ token/violation ໃໝ່        |
| `npm run check:tokens:update`     | ອັບເດດ baseline ຫຼັງແກ້ legacy |
| `npm run cap:sync`                | generate + `cap sync`          |
| `npm run cap:android` / `cap:ios` | ເປີດ native project            |

## ໂຄງສ້າງ

```text
app/
├── assets/{css,fonts,img}
├── components/{base,ui,shell,feature}
├── composables/ + composables/api/
├── config/{navigation,permissions}
├── layouts/{auth,admin,mobile,blank}
├── middleware/{auth.global,permission.global}
├── mocks/
├── pages/
├── plugins/
├── stores/{auth,ui}
└── utils/
docs/
scripts/check-tokens.mjs
tests/{unit,e2e}
```

## Conventions

- Component: `PascalCase`; composable: `useXxx`; mock: entity plural.
- ທຸກໜ້າໃຊ້ `definePageMeta({ layout, title, permission })`; **ຫ້າມ** ຫໍ່ `<NuxtLayout>` ໃນ page.
- ຂໍ້ມູນຜ່ານ `useXxx()` ເທົ່ານັ້ນ; ຫ້າມ hard-code array ໃນ page.
- ສີ/typography ໃຊ້ token; **ຫ້າມ** ສີ Tailwind ດິບ, `font-black`, `text-[10px]`, `text-[11px]`.
- ຫ້າມ asset/CDN ພາຍນອກ; ຮູບທັງໝົດຢູ່ `app/assets/img` ຫຼື `public/`.
- ເງິນ/ວັນທີ/ເບີໂທ ຜ່ານ `useFormat()`.
- ຂໍ້ຄວາມ UI ຜ່ານ glossary ຫຼື `useT()`; ບໍ່ປົນພາສາ.
- ບໍ່ມີ `console.log`, secret, ຫຼື credential ໃນ log/ໂຄດ.

## Mock accounts (DEMO)

ບັນຊີລຸ່ມນີ້ເປັນ **fixture ສຳລັບ dev/test ເທົ່ານັ້ນ** ບໍ່ແມ່ນບັນຊີຈິງ:

| Role     | Email                  | Password    |
| -------- | ---------------------- | ----------- |
| admin    | `admin@saiyfon.com`    | `Demo@1234` |
| staff    | `staff@saiyfon.com`    | `Demo@1234` |
| agent    | `agent@saiyfon.com`    | `Demo@1234` |
| customer | `customer@saiyfon.com` | `Demo@1234` |

> ບັນຊີເຫຼົ່ານີ້ຖືກ seed ໂດຍ `server/npm run seed` (dev ເທົ່ານັ້ນ).

## Mock switch

```bash
NUXT_PUBLIC_USE_MOCK=false
NUXT_PUBLIC_API_BASE=http://localhost:5055/api
NUXT_PUBLIC_PLATFORM_URL=http://localhost:3001

# Multi-tenant bootstrap
NUXT_PUBLIC_TENANT_MODE=auto
NUXT_PUBLIC_DEFAULT_TENANT_SLUG=saiyfon
NUXT_PUBLIC_DEFAULT_TENANT_NAME=ສາຍຝົນ ປະກັນໄພ
NUXT_PUBLIC_DEFAULT_BRAND_COLOR=#047857

# Optional: only used while NUXT_PUBLIC_USE_MOCK=true
# NUXT_PUBLIC_MOCK_DELAY=450
# NUXT_PUBLIC_MOCK_FAILURE_RATE=0
```

> Default ແມ່ນ **real API** (`useMock=false`). ຖ້າຢາກເຮັດ UI ແບບ offline ໃຫ້ຕັ້ງ `NUXT_PUBLIC_USE_MOCK=true`.
> ຫຼັງແກ້ `nuxt.config.js` ຕ້ອງ restart dev server (runtimeConfig ບໍ່ hot-reload).

## Multi-tenant

- ແຕ່ລະ tenant ໃຊ້ build ດຽວກັນ; ຕອນ boot `plugins/tenant.client.js` ຈະ resolve tenant:
  - **web**: ຈາກ `Host` (`acme.saiyfon.app` / custom domain)
  - **localhost dev**: ຈາກ slug ທີ່ບັນທຶກ ຫຼື `NUXT_PUBLIC_DEFAULT_TENANT_SLUG`
  - **mobile**: ຈາກ Capacitor Preferences (ຖ້າຍັງບໍ່ມີ ຈະໄປໜ້າ `/select-company`)
- `stores/tenant.js` ເກັບ `{ slug, name, status, branding, features, locale, currency }` ແລະ ປ່ຽນ CSS vars (`--sf-primary*`) + title/theme-color.
- ທຸກ API ຜ່ານ `composables/api/useApiClient.js` ທີ່ໃສ່ `X-Tenant` ແລະ `Authorization` ໃຫ້.
- Guards: `/tenant-not-found` (domain ບໍ່ຜູກ), `/maintenance` (tenant ຖືກປິດ), `/select-company` (mobile).
- `NUXT_PUBLIC_TENANT_MODE=mock` ໃຊ້ default brand ໂດຍບໍ່ຍິງ API (dev ໄວໆ).

## Capacitor (mobile)

`npm run cap:sync` ຈະ `generate` ແລະ bake `NUXT_PUBLIC_*` ລົງ bundle. ກ່ອນ build ໃຫ້ຕັ້ງ API ຈິງ:

```bash
NUXT_PUBLIC_API_BASE=https://api.saiyfon.app/api \
NUXT_PUBLIC_TENANT_MODE=auto \
NUXT_PUBLIC_USE_MOCK=false \
npm run cap:sync
```

Mobile ຈະຖາມລະຫັດບໍລິສັດຄັ້ງທຳອິດ (`/select-company`) ແລ້ວເກັບໄວ້ໃນ Preferences.

## ເອກະສານ

- `docs/glossary.md` — ຄຳສັບລາວມາດຕະຖານ
- `docs/api-contract.md` — ສັນຍາ API/mock
- `docs/page-recipe.md` — checklist ສຳລັບໜ້າໃໝ່
- `docs/DEVELOPMENT_PLAN.md` — ແຜນພັດທະນາເດີມ
- `docs/IMPLEMENTATION_STATUS.md` — ສະຖານະການປະຕິບັດ ແລະ ວຽກຕໍ່
