# Execution Plan — Frontend Mock Round

> ແຜນຍ່ອຍສຳລັບປະຕິບັດງານ `client/`. ແຜນຫຼັກຢູ່ `DEVELOPMENT_PLAN.md`; ສະຖານະຕົວຈິງຢູ່ `IMPLEMENTATION_STATUS.md`.

## ຫຼັກການ WBS

- 1 Task ≤ 0.5 ມື້, 1 commit, ມີເງື່ອນໄຂຜ່ານ.
- ຫ້າມ big-bang; ຍ້າຍໜ້າລະກຸ່ມ ແລະ ລຶບ legacy ຫຼັງກວດ.
- ທຸກ UI ຜ່ານ 3 viewport × light/dark.
- ທຸກ ໜ້າ/component ຜ່ານ lint, token check, ແລະ a11y.

## WP0 — Foundation & Tooling (✅)

| Task | ຜົນຮັບ |
|---|---|
| ຕິດຕັ້ງ VueUse, ESLint, Prettier, Vitest, Playwright, axe, Capacitor plugins | `package.json` |
| `nuxt.config.js`: modules, runtimeConfig, components pathPrefix, head, theme boot | config |
| `eslint.config.mjs`, Prettier, Vitest, Playwright | configs |
| `scripts/check-tokens.mjs` + baseline | token gate |
| ລຶບ `console.log`, ແທນ asset ພາຍນອກ | local assets |
| README, glossary, API contract, page recipe | docs |

**ຜ່ານ**: lint/test/build; ບໍ່ມີ console/URL ພາຍນອກ.

## WP1 — Tokens & Typography (✅)

- `tokens.css`: semantic colors, dark mode, success/warning/danger/info, on-primary.
- `@custom-variant dark`; variable font 100–900; 16px root.
- Typography scale, reduced motion, skeleton animation.
- `/dev/tokens` catalog.
- Token baseline 0.

**ຜ່ານ**: contrast AA light/dark; 0 raw-color violations.

## WP2 — Shell, Layouts & Responsive (✅)

- `useScreen`, `useNavigation`, `config/{navigation,permissions}`.
- `stores/{auth,ui}`, `plugins/layout.client`.
- `layouts/{auth,admin,mobile,blank}`.
- `AppSidebar`, `AppRail`, `AppHeader`, `AppFooter`, `BottomTabBar`, `MobileDrawer`, `MobileTopBar`, `UserMenu`, `NotificationMenu`, `GlobalSearch`, `Breadcrumb`.
- `error.vue` + `/403`.

**ຜ່ານ**: 375/768/1280 ປ່ຽນ shell ໂດຍບໍ່ reload; no remount.

## WP3 — Base & UI Components (✅)

- Base: Button, Input, Select, Textarea, Checkbox, Radio, Switch, Badge, Avatar, Card, Modal, Drawer, Dropdown, Tabs, Tooltip, Spinner, Skeleton, Icon.
- UI: PageHeader, StatCard, StatusBadge, FilterBar, SearchInput, Pagination, EmptyState, ErrorState, FormField, DataTable, FileUpload, Stepper, DateRangePicker, ToastHost, ConfirmDialog.
- Composables: useFormat, useToast, useConfirm, validators, constants, premium.
- `/dev/components` catalog.

**ຜ່ານ**: states + dark + keyboard; unit tests ສຳລັບ DataTable/Dropdown/Modal/format/validators/premium.

## WP4 — Mock & Auth (✅)

- `mocks/_helpers.js` + fixtures ທຸກ entity.
- `composables/api/*` + contract `{ items,total,page,pageSize,pending,error,refresh,filters }`.
- `useAuth`: mock/API switch, cookie session, role landing.
- `auth.global`, `permission.global`, `/403`.
- Login: error, show/hide, remember, lock 5 ຄັ້ງ, demo accounts (dev).
- Role menus/tabs.

**ຜ່ານ**: 4 roles; refresh ຢູ່; logout ລ້າງ; ບໍ່ມີ credential ໃນ log.

## WP5 — Policies Reference (✅)

- List desktop/table + mobile cards, filters, search, pagination.
- Detail `[id]`.
- Wizard 6 ຂັ້ນ + validation + draft + premium calc + success.
- `utils/premium.js` ກົງກັບ server logic (VAT 7% + 20,000 LAK).
- Page recipe.

**ຜ່ານ**: E2E create policy; 3 viewport.

## WP6 — ໜ້າທີ່ເຫຼືອ (✅)

Dashboard, customers + detail, quotations + create/detail, claims + create/detail, agents + detail, teams, commissions, finance invoices/payments, reports, users, settings, profile, home.

**ຜ່ານ**: ບໍ່ມີ legacy wrapper/`layout:false`; token baseline 0.

## WP7 — A11y, Polish, Performance (✅/⚠️)

- axe serious/critical = 0 ໃນ key routes (light + dark + mobile).
- Keyboard, focus ring, table semantics, card lists, form labels.
- Global search ⌘K.
- i18n = glossary ລາວ (ບໍ່ຕິດ @nuxtjs/i18n).
- Bundle: main ~90 KB gzip; material icons ໃຊ້ filled ເທົ່ານັ້ນ.
- Coverage ~25.7%; threshold baseline 25/24/24/19 — **ຕ້ອງເພີ່ມ tests ກ່ອນ release**.

## WP8 — Capacitor & QA (✅ sync / ⏳ device)

- `nuxt generate` → `.output/public` (dev routes excluded in production).
- `npx cap sync` ສຳເລັດ; Android/iOS ໄດ້ 6 plugins.
- ຍັງຕ້ອງ: ທົດສອບ iOS Simulator / Android Emulator, safe-area, back button, keyboard, offline smoke.

## ເວລາ

| WP | ມື້ (1 ຄົນ) |
|---|---:|
| WP0 | 2 |
| WP1 | 1.5 |
| WP2 | 4.5 |
| WP3 | 6 |
| WP4 | 4 |
| WP5 | 5 |
| WP6 | 12 |
| WP7 | 3 |
| WP8 | 3 |
| ລວມ | ~41.5 + buffer |

## Quality Gates

```bash
npm run lint
npm run format:check
npm run test:unit
npm run test:coverage
npm run check:tokens
npm run build
```

E2E:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=".../Google Chrome for Testing" \
  npx playwright test --project=desktop --workers=1
```

## ຄວາມສ່ຽງຫຼັກ

| ຄວາມສ່ຽງ | ການຮັບມື |
|---|---|
| Konsta/Tailwind 4 | ຈຳກັດໃນ mobile layout; fallback Base |
| Layout ປ່ຽນແລ້ວ state ຫາຍ | state ຢູ່ Pinia; ບໍ່ຢູ່ layout |
| Mock ≠ API | `docs/api-contract.md`; server ຍັງຂາດ entity |
| Coverage ຕ່ຳ | ເພີ່ມ unit/component tests ກ່ອນ release |
| Port 5000 ຊະນະ AirPlay | `PORT=5055 npm run dev` |
| Browser download ລົ້ມເຫຼວ | ໃຊ້ `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` |
