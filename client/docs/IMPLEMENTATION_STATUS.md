# Implementation Status — Frontend Mock Round

> ອັບເດດຫຼ້າສຸດ: 2026-10-25 · ຂອບເຂດ: `client/` ດ້ວຍ Mock Data

## SaaS Round (2026-10-25)

| ລາຍການ | ສະຖານະ |
|---|---|
| Server multi-tenant schema + platform API + Redis | ✅ |
| Dockerfile (server) + Coolify + dev MySQL/Redis | ✅ |
| Admin console (`admin/`) + Dockerfile static | ✅ |
| Client tenant bootstrap + branding (CSS vars/title/logo) | ✅ |
| Client guards: tenant-not-found / maintenance / select-company (mobile) | ✅ |
| `useApiClient` ໃສ່ `X-Tenant` + `Authorization` | ✅ |
| Client auth ເຊື່ອມ server ຈິງ (`useMock=false`) | ✅ |
| API ທຸລະກິດຈິງ (policies/customers/agents/teams/claims/quotations/commissions/invoices/payments/dashboard) | ✅ |
| E2E real mode: admin/staff/agent/customer + ທຸກໜ້າຫຼັກ | ✅ 0 error |
| Rate limit + plan limits + server unit tests | ✅ |

> ຫຼັງແກ້ `nuxt.config.js` ຕ້ອງ restart dev server; ຖ້າ API ບໍ່ຢູ່ ໃຫ້ `NUXT_PUBLIC_TENANT_MODE=mock`.

## ສະຫຼຸບ

| ລາຍການ | ສະຖານະ |
|---|---|
| Design tokens + dark mode | ✅ |
| 3 shell/layout (auth/admin/mobile) | ✅ |
| Base/UI components + dev catalog | ✅ |
| Mock data + composables | ✅ |
| Auth + role/permission + guards | ✅ |
| Policies reference page + wizard | ✅ |
| ໜ້າທີ່ເຫຼືອ (dashboard/customers/claims/quotations/agents/teams/commissions/finance/reports/users/settings/profile/home) | ✅ |
| a11y (axe serious/critical) | ✅ 0 |
| Token/external asset/console checks | ✅ 0 |
| Unit tests | ✅ 28 |
| Real-mode E2E (4 roles + 11 ໜ້າ) | ✅ 0 error |
| Stats endpoints ຕໍ່ໜ້າ list | ✅ |
| E2E Playwright (desktop + mobile) | ✅ 5 + 4 |
| Capacitor sync | ✅ (`npx cap sync`) |
| Capacitor device test | ⏳ |
| Coverage 70% target | ⚠️ ຍັງບໍ່ຮອດ |

## ສິ່ງທີ່ກວດແລ້ວ

```bash
npm run lint
npm run format:check
npm run test:unit
npm run test:coverage
npm run check:tokens
npm run build
```

- `check:tokens`: 0 legacy violations; ບໍ່ມີສີດິບ, `font-black`, `text-[10-11px]`, URL ພາຍນອກ, `console.log`, `layout:false`, ຫຼື `<NuxtLayout>` ໃນ page.
- `axe`: 0 serious/critical ໃນ dashboard, policies, claims, home, settings, profile, mobile policies.
- E2E desktop: auth guard/login/logout, invalid login, policy list/search/detail, policy wizard, a11y.
- E2E mobile: login, profile logout, bottom tabs, card list, drawer, a11y.
- `npm run build`: ຜ່ານ; main route chunk ~90 KB gzip.

## ຂໍ້ຈຳກັດ / ວຽກຕໍ່

1. **Coverage**: ປັດຈຸບັນ ~25.7% lines. Threshold ຖືກຕັ້ງເປັນ baseline ເພື່ອໃຫ້ CI ຜ່ານ; ຕ້ອງເພີ່ມ test ໃຫ້ `components/base|ui` ແລະ `composables` ກ່ອນ release.
2. **Capacitor**: `nuxt generate` + `npx cap sync` ຜ່ານແລ້ວ; ຍັງຕ້ອງ smoke test iOS Simulator / Android Emulator, safe-area, back button, keyboard, offline.
3. **ຟອມທີ່ຍັງ mock**: ແກ້ໄຂລູກຄ້າ/ຕົວແທນ, ສ້າງ invoice/payment, ຈັດການຜູ້ໃຊ້ — ປັດຈຸບັນສະແດງ toast ຫຼື mock action.
4. **i18n**: ໃຊ້ glossary ລາວດຽວ, ຍັງບໍ່ໄດ້ຕິດ `@nuxtjs/i18n`.
5. **API ຈິງ**: `useMock=true` ເປັນຄ່າຕັ້ງຕົ້ນ; server ຍັງຂາດ quotations/claims/invoices/payments/teams.
6. **Server dev**: ປ່ຽນ `tsx watch` ແລ້ວ; ຖ້າ port 5000 ຖືກ AirPlay ໃຊ້, ໃຫ້ `PORT=5055 npm run dev`.
7. **Playwright browser**: `npx playwright install` ອາດລົ້ມເຫຼວໃນເຄືອຂ່າຍນີ້; ໃຊ້ `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` ຊີ້ໄປ Chromium ທີ່ມີຢູ່.

## ຄຳສັ່ງ E2E

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="$HOME/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing" \
  npx playwright test --project=desktop --workers=1
```

## ໄຟລ໌ສຳຄັນ

- `app/config/{navigation,permissions}.js`
- `app/composables/{useScreen,useNavigation,useToast,useConfirm}.js`
- `app/composables/api/*`
- `app/mocks/*`
- `app/components/{base,ui,shell,feature}`
- `app/middleware/{auth.global,permission.global}.js`
- `app/pages/*`
- `tests/unit`, `tests/e2e`
