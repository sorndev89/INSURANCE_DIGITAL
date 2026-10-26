# ແຜນພັດທະນາ Frontend — Saiyfon Insurance Digital (`client/`)

> ເອກະສານນີ້ລວບລວມຜົນວິເຄາະໂຄງສ້າງໂປຣເຈັກ, UX/UI, ແລະ ສະຖາປັດຕະຍະກຳ Component/Responsive ເຂົ້າເປັນແຜນພັດທະນາດຽວ.
> ຂອບເຂດຮອບນີ້: **Frontend ດ້ວຍ Mock Data** (ຍັງບໍ່ເຊື່ອມ API ຈິງ). ສະຖານະ: ຮ່າງແຜນ, ຍັງບໍ່ເລີ່ມ implement.
>
> **ອັບເດດ:** ແຜນນີ້ຖືກປະຕິບັດແລ້ວເປັນສ່ວນໃຫຍ່. ເບິ່ງ `EXECUTION_PLAN.md` ແລະ `IMPLEMENTATION_STATUS.md` ສຳລັບສະຖານະຕົວຈິງ.

---

## 0. ສາລະບານ
1. [ສະຖານະປັດຈຸບັນ](#1-ສະຖານະປັດຈຸບັນ-as-is)
2. [ເປົ້າໝາຍ ແລະ ຂອບເຂດ](#2-ເປົ້າໝາຍ-ແລະ-ຂອບເຂດ)
3. [ການຕັດສິນໃຈດ້ານສະຖາປັດຕະຍະກຳ](#3-ການຕັດສິນໃຈດ້ານສະຖາປັດຕະຍະກຳ)
4. [ໂຄງສ້າງໂຟລເດີເປົ້າໝາຍ](#4-ໂຄງສ້າງໂຟລເດີເປົ້າໝາຍ)
5. [Design System](#5-design-system)
6. [Responsive: Desktop / Tablet / Mobile](#6-responsive-desktop--tablet--mobile)
7. [ລາຍການ Components](#7-ລາຍການ-components)
8. [Mock Data & Data Layer](#8-mock-data--data-layer)
9. [Auth, Role & Permission](#9-auth-role--permission)
10. [ແຜນເປັນ Phase](#10-ແຜນເປັນ-phase)
11. [ແຜນທີ່ໜ້າ (Page Map)](#11-ແຜນທີ່ໜ້າ-page-map)
12. [Accessibility & i18n](#12-accessibility--i18n)
13. [Capacitor (Android/iOS)](#13-capacitor-androidios)
14. [ການທົດສອບ ແລະ ຄຸນນະພາບ](#14-ການທົດສອບ-ແລະ-ຄຸນນະພາບ)
15. [ຄວາມສ່ຽງ](#15-ຄວາມສ່ຽງ-ແລະ-ການຮັບມື)
16. [ສິ່ງທີ່ຕ້ອງຕົກລົງ](#16-ສິ່ງທີ່ຕ້ອງຕົກລົງກ່ອນເລີ່ມ)
17. [Definition of Done](#17-definition-of-done)

---

## 1. ສະຖານະປັດຈຸບັນ (As-Is)

### 1.1 Tech stack
| ສ່ວນ | ເຕັກໂນໂລຢີ |
|---|---|
| Framework | Nuxt 4.3 (`ssr:false`, `compatibilityVersion:4`), Vue 3.5 |
| State | Pinia (`@pinia/nuxt`) |
| CSS | Tailwind CSS 4 (`@tailwindcss/vite`), `@theme` tokens ໃນ `main.css` |
| Mobile UI | Konsta UI 5, material-icons |
| Device | `@nuxtjs/device` |
| Native | Capacitor 8 (`com.saiyfon.insurance`, `webDir: .output/public`) |
| Font | Noto Sans Lao (Regular 400, Bold 700 ໃນ `@font-face`; ມີໄຟລ໌ Variable ແຕ່ບໍ່ໄດ້ໃຊ້) |

### 1.2 ຂະໜາດ
~2,200 ແຖວ `.vue` ໃນ 14 ໜ້າ + 7 components. ສ່ວນໃຫຍ່ເປັນ prototype UI.

### 1.3 ບັນຫາທີ່ພົບ (ສະຫຼຸບ)
| # | ໝວດ | ບັນຫາ | ຜົນກະທົບ |
|---|---|---|---|
| L1 | Layout | ທຸກໜ້າໃຊ້ `definePageMeta({layout:false})` + ຫໍ່ `<NuxtLayout name="desktop">` ເອງ (12 ໜ້າ) | Sidebar/Header remount ທຸກຄັ້ງ, state ຫາຍ, code ຊ້ຳ |
| L2 | Layout | ມືຖືມີແຕ່ໜ້າ home; ໜ້າອື່ນໃນມືຖືໄດ້ layout desktop ແຕ່ Sidebar ຖືກຊ່ອນ ແລະ ປຸ່ມ ☰ ບໍ່ມີ `@click` | ໃຊ້ງານໃນມືຖືບໍ່ໄດ້ |
| L3 | Layout | ແຍກ desktop/mobile ດ້ວຍ User-Agent ເທົ່ານັ້ນ; ບໍ່ມີ Tablet | iPad / ຍ່ອ browser ຜິດ |
| U1 | UX | ບໍ່ມີ route guard / ບໍ່ມີ auth ຈິງ; store ບໍ່ persist | ເຂົ້າທຸກໜ້າໄດ້ໂດຍບໍ່ login |
| U2 | UX | `login.vue` ມີ `console.log(email, password)` | **ຮົ່ວລະຫັດຜ່ານລົງ console** |
| U3 | UX | Login ບໍ່ມີ error state / show-hide password / ລືມລະຫັດ; "ຈົດຈຳ" ບໍ່ເຮັດຫຍັງ | UX ບໍ່ຄົບ |
| U4 | UX | Logout ພຽງ `router.push('/login')` ບໍ່ clear store | session ຄ້າງ |
| U5 | UX | Header hard-code ຊື່/ຮູບ Unsplash/ອີເມວ (`somsak.@saiyfon.com` ຮູບແບບຜິດ) | ບໍ່ສະທ້ອນຜູ້ໃຊ້ຈິງ |
| U6 | UX | ຮູບພາຍນອກ (Unsplash, googleusercontent) | ໃຊ້ບໍ່ໄດ້ offline ໃນ app Capacitor |
| U7 | UX | ບໍ່ມີ Loading/Empty/Error state (`commissions`: "... Data Loading ..." ຄົງທີ່) | ຜູ້ໃຊ້ບໍ່ຮູ້ສະຖານະ |
| U8 | UX | Breadcrumb ກົດບໍ່ໄດ້; `pageTitle` ເປັນ `if/includes` ບໍ່ຄົບ (quotations, claims, teams, commissions, finance ຕົກ default) | ຊື່ໜ້າຜິດ |
| U9 | UX | Search ໃນ Header ບໍ່ເຮັດວຽກ ແລະ ຖືກຊ່ອນ < `lg` | ຄົ້ນຫາບໍ່ໄດ້ |
| D1 | Design | ສີບໍ່ເປັນລະບົບ: emerald + blue + indigo + teal + amber (37 ຈຸດ blue/indigo); Wizard ໃຊ້ `blue-600` ຂັດແບຣນດ໌ | ບໍ່ສອດຄ່ອງ |
| D2 | Design | Class ຍາວຄັດລອກ (ປຸ່ມ/card/input/badge) ທຸກໜ້າ; Stat card ຄົນລະແບບ | ບຳລຸງຍາກ |
| D3 | Design | `html{font-size:14px}` + `text-[10px]/[11px]` + `font-black` (900) ທັງທີ່ font ມີແຕ່ 400/700 | ອ່ານຍາກ, ຕົວອັກສອນລາວເລັກ, faux-bold |
| D4 | Design | ຂໍ້ຄວາມປົນ ລາວ/ອັງກິດ ("Overview", "Sales & Services"); ຄຳສັບບໍ່ຄົງທີ່ | ບໍ່ເປັນມືອາຊີບ |
| D5 | Design | ເງິນ/ວັນທີ ຂຽນຕົງໃນ markup | format ບໍ່ຄົງທີ່ |
| A1 | A11y | ປຸ່ມ icon ບໍ່ມີ `aria-label`; dropdown ບໍ່ມີ `aria-expanded`/Esc; ໃຊ້ overlay div | ເຂົ້າເຖິງຍາກ |
| A2 | A11y | `animate-pulse` ຖາວອນ (ເມນູ active, ຈຸດ notification); contrast `slate-400` + 10px ຕໍ່າ | ລົບກວນ / ບໍ່ຜ່ານ AA |
| A3 | A11y | Sidebar ບໍ່ມີ collapse ທັງທີ່ມີ `transition-all` | ເມນູ 13 ລາຍການ ກິນທີ່ |
| C1 | Config | `alias: {'konsta/vue':'konsta/vue'}` ຊີ້ຕົວເອງ; ບໍ່ມີ ESLint/Prettier/test; README ຂອງ client ວ່າງ | ຂາດ tooling |
| F1 | Form | `policies/create` (93 ແຖວ) ແລະ `PurchaseWizard` (163 ແຖວ) ເປັນ 2 ຊຸດຊ້ຳກັນ; ບໍ່ມີ validation | ຊ້ຳ + ບໍ່ປອດໄພ |

---

## 2. ເປົ້າໝາຍ ແລະ ຂອບເຂດ

### 2.1 ເປົ້າໝາຍ
1. ມີ **Design System** ດຽວ (token + Base/UI components) ທີ່ທຸກໜ້າໃຊ້ຮ່ວມກັນ.
2. ຮອງຮັບ **Desktop / Tablet / Mobile** ແຍກ shell ຊັດເຈນ ໂດຍໃຊ້ຄວາມສາມາດຂອງ Nuxt (layouts, middleware, auto-import, lazy components).
3. ທຸກໜ້າເຮັດວຽກດ້ວຍ **Mock Data** ທີ່ຈຳລອງ delay/pagination/filter/error; ສະຫຼັບເປັນ API ຈິງໄດ້ໂດຍບໍ່ແກ້ໜ້າ.
4. **Auth ຈຳລອງ** ພ້ອມ role + permission + route guard.
5. ຜ່ານມາດຕະຖານ UX ພື້ນຖານ: ມີ loading/empty/error ທຸກບ່ອນ, a11y ລະດັບ WCAG AA, ເຮັດວຽກ offline ໃນ app (ບໍ່ມີ asset ພາຍນອກ).

### 2.2 ນອກຂອບເຂດ (ຮອບນີ້)
- Backend `server/` ແລະ ການເຊື່ອມ API ຈິງ (ວາງ interface ໄວ້ກຽມ).
- ການຊຳລະເງິນຈິງ, push notification ຈິງ, OCR ບັດປະຊາຊົນ.
- Multi-tenant / ຫຼາຍບໍລິສັດປະກັນ ແບບເລິກ (ມີແຕ່ mock).

### 2.3 ຜູ້ໃຊ້ (Personas) — ເພື່ອຢືນຢັນ
| Role | ອຸປະກອນຫຼັກ | ສິ່ງທີ່ເຮັດ |
|---|---|---|
| `admin` | Desktop/Tablet | ທຸກໂມດູນ, ຕັ້ງຄ່າ, ຜູ້ໃຊ້ |
| `staff` | Desktop | ປະກັນໄພ, ລູກຄ້າ, ເຄມ, ການເງິນ |
| `agent` | **Mobile** + Tablet | ຂາຍ/ເບີກປະກັນໄພ, ລູກຄ້າຂອງຕົນ, ຄອມມິດຊັ່ນ, ທີມ |
| `customer` | **Mobile** | ຊື້ປະກັນ, ປະກັນໄພຂອງຂ້ອຍ, ແຈ້ງເຄມ, ຊຳລະ |

---

## 3. ການຕັດສິນໃຈດ້ານສະຖາປັດຕະຍະກຳ

| ID | ການຕັດສິນໃຈ | ເຫດຜົນ |
|---|---|---|
| ADR-1 | ແບ່ງ 3 ຊັ້ນ: **Logic (100% ຮ່ວມ) / Base UI (~90% ຮ່ວມ, ປັບດ້ວຍ Tailwind breakpoint) / Shell+View (ແຍກຕາມອຸປະກອນ)** | ຫຼີກລ່ຽງ code ຊ້ຳ 3 ຊຸດ |
| ADR-2 | ກົດ: ຕ່າງແຕ່ຂະໜາດ/ຈຳນວນຖັນ → CSS breakpoint; ຕ່າງໂຄງສ້າງການນຳທາງ/ການໂຕ້ຕອບ → ແຍກ component | ຫຍໍ້ໃຫ້ແຍກ view ໜ້ອຍທີ່ສຸດ |
| ADR-3 | ກວດອຸປະກອນດ້ວຍ **viewport breakpoint (`useBreakpoints` ຈາກ VueUse)** ເປັນຫຼັກ; `@nuxtjs/device` ໃຊ້ກວດ platform (iOS/Android) ເທົ່ານັ້ນ | UA ຜິດກັບ iPad, ບໍ່ reactive ຕອນ resize/ໝຸນຈໍ |
| ADR-4 | Layout ເລືອກໂດຍ `definePageMeta` + `setPageLayout` ເມື່ອ resize; **ເລີກ** wrapper `<NuxtLayout>` ໃນແຕ່ລະໜ້າ | ແກ້ L1 |
| ADR-5 | Konsta ຈຳກັດໃນ `layouts/mobile.vue` + view ມືຖືເທົ່ານັ້ນ; Base components ເປັນ Tailwind ລ້ວນ | Konsta ຕ້ອງການ `<k-app>` ຮາກ ແລະ theme ຂອງຕົນ |
| ADR-6 | ເມນູ/ການນຳທາງມີຕົ້ນກຳເນີດດຽວ (`config/navigation.js`) ພ້ອມ `roles` | ໃຊ້ຮ່ວມ Sidebar/Rail/BottomTab/Drawer/Breadcrumb |
| ADR-7 | Data ຜ່ານ composable `useXxx()` ທີ່ສະຫຼັບ mock ↔ API ດ້ວຍ `runtimeConfig.public.useMock` | ເຊື່ອມ API ພາຍຫຼັງໂດຍບໍ່ແກ້ໜ້າ |
| ADR-8 | ແຕ່ລະໜ້າສົ່ງ **props ຊຸດດຽວກັນ** (`items, loading, error`) ໃຫ້ view Desktop/Mobile | ເພີ່ມ/ປ່ຽນ view ໂດຍບໍ່ແຕະ logic |
| ADR-9 | ໃຊ້ **JavaScript** ຕາມເດີມ (ບໍ່ migrate TS ໃນຮອບນີ້); ໃຊ້ JSDoc ກຳນົດ shape ຂອງ mock | ຫຼຸດຂອບເຂດ; ພິຈາລະນາ TS ພາຍຫຼັງ |

---

## 4. ໂຄງສ້າງໂຟລເດີເປົ້າໝາຍ

```
client/
├── docs/                          ← ເອກະສານ (ໄຟລ໌ນີ້, glossary, ADR)
├── nuxt.config.js
├── eslint.config.js · .prettierrc
├── vitest.config.js · playwright.config.js
└── app/
    ├── app.vue
    ├── app.config.js              ← ຊື່ແອັບ, theme, ຄ່າຄົງທີ່ UI
    ├── error.vue                  ← 404/500 ກາງ
    ├── assets/
    │   ├── css/ main.css · tokens.css · components.css (@apply ໜ້ອຍທີ່ສຸດ)
    │   ├── fonts/ NotoSansLao-*.ttf
    │   └── img/ auth-bg.webp, logo.svg, avatar-placeholder.svg   ← ຮູບ local ທັງໝົດ
    ├── config/
    │   ├── navigation.js          ← ເມນູ + roles + icon + path
    │   └── permissions.js         ← role → permission map
    ├── layouts/
    │   ├── auth.vue               ← login / forgot
    │   ├── admin.vue              ← desktop + tablet (Sidebar ເຕັມ / Rail)
    │   └── mobile.vue             ← <k-app> + BottomTabBar + Drawer
    ├── middleware/
    │   ├── auth.global.js         ← redirect ຖ້າບໍ່ login
    │   └── permission.js          ← ກວດ meta.permission
    ├── plugins/
    │   └── layout.client.js       ← ປ່ຽນ layout ຕາມ breakpoint
    ├── composables/
    │   ├── useScreen.js           ← isMobile/isTablet/isDesktop/form
    │   ├── useNavigation.js       ← ເມນູທີ່ກອງຕາມ role + breadcrumb
    │   ├── useFormat.js           ← currency (₭), date, phone, number
    │   ├── useToast.js · useConfirm.js
    │   └── api/ useAuth.js · usePolicies.js · useCustomers.js · useAgents.js
    │            useClaims.js · useQuotations.js · useCommissions.js ·
    │            useInvoices.js · usePayments.js · useUsers.js · useDashboard.js
    ├── mocks/
    │   ├── _helpers.js            ← delay(), paginate(), filter(), maybeFail()
    │   └── users.js customers.js agents.js teams.js policies.js quotations.js
    │       claims.js commissions.js invoices.js payments.js products.js
    │       companies.js dashboard.js
    ├── stores/
    │   ├── auth.js                ← user, token, role (persist)
    │   └── ui.js                  ← sidebarCollapsed, drawerOpen, theme
    ├── utils/ constants.js · validators.js · glossary.js
    ├── components/
    │   ├── base/    BaseButton BaseCard BaseInput BaseSelect BaseTextarea
    │   │            BaseCheckbox BaseRadio BaseSwitch BaseBadge BaseAvatar
    │   │            BaseModal BaseDrawer BaseDropdown BaseTabs BaseSpinner
    │   │            BaseSkeleton BaseIcon BaseTooltip
    │   ├── ui/      PageHeader StatCard StatusBadge EmptyState ErrorState
    │   │            FilterBar SearchInput DataTable Pagination ConfirmDialog
    │   │            ToastHost FormField FileUpload Stepper DateRangePicker
    │   ├── shell/   AppSidebar AppRail AppHeader AppFooter BottomTabBar
    │   │            MobileDrawer UserMenu NotificationMenu GlobalSearch Breadcrumb
    │   └── feature/
    │       ├── policy/    PolicyListDesktop PolicyListMobile PolicyWizard
    │       │              PolicyDetail PolicyStatusBadge
    │       ├── customer/  ...
    │       ├── dashboard/ KpiRow RevenueChart PolicyDonut RecentActivity
    │       └── ...
    └── pages/               (ດູ §11)
```

**ຂໍ້ກຳນົດການຕັ້ງຊື່**
- Component: `PascalCase`; prefix ໂຟລເດີຕາມ auto-import ຂອງ Nuxt (`base/BaseButton.vue` → `<BaseButton>`).
- Composable: `useXxx`; mock: ຊື່ພະຫຸພົດຕາມ entity.
- ຂໍ້ຄວາມ UI **ຕ້ອງຜ່ານ glossary** (`utils/glossary.js`) ຫຼື i18n key, ຫ້າມປົນພາສາ.

---

## 5. Design System

### 5.1 Color tokens (Tailwind 4 `@theme`)
ຮັກສາ **primary = emerald** ເປັນສີແບຣນດ໌. ເພີ່ມ semantic token ແທນການໃຊ້ `blue-*`/`indigo-*` ຕົງໆ.

| Token | ຄ່າ | ໃຊ້ກັບ |
|---|---|---|
| `primary` / `primary-dark` / `primary-light` | `#10b981` / `#059669` / `#d1fae5` | ປຸ່ມຫຼັກ, ເມນູ active, link |
| `success` | emerald-600 | ສຳເລັດ, ມີຜົນ (Active) |
| `warning` | amber-500 | ໃກ້ໝົດອາຍຸ, ລໍຖ້າ |
| `danger` | rose-600 | ຜິດພາດ, ປະຕິເສດ, ໝົດອາຍຸ |
| `info` | sky-600 | ຂໍ້ມູນ, ກຳລັງດຳເນີນການ |
| `surface` / `surface-dark` | `#ffffff` / `#182430` | card |
| `background` / `background-dark` | `#f6f7f8` / `#101922` | ພື້ນຫຼັງ |
| `text-muted` | slate-600 (≥ 4.5:1 ເທິງຂາວ) | ຂໍ້ຄວາມຮອງ (ແທນ `slate-400`) |

ກົດ: **ຫ້າມໃຊ້ສີ Tailwind ດິບ** (`blue-500`, `indigo-*`, `teal-*`) ໃນ feature/page; ໃຊ້ token ເທົ່ານັ້ນ. ເພີ່ມ ESLint rule/grep ກວດໃນ CI.

### 5.2 Typography (ປັບສຳລັບພາສາລາວ)
| Token | ຂະໜາດ | line-height | ໃຊ້ |
|---|---|---|---|
| `text-xs` | 12px (ຂັ້ນຕ່ຳ, ຫ້າມ 10/11px) | 1.7 | caption, badge |
| `text-sm` | 14px | 1.7 | ຂໍ້ຄວາມຕາຕະລາງ, label |
| `text-base` | 16px | 1.7 | body |
| `text-lg` | 18px | 1.6 | ຫົວຂໍ້ card |
| `text-2xl` | 24px | 1.4 | ຫົວຂໍ້ໜ້າ |
| `text-3xl` | 30px | 1.3 | ຕົວເລກ KPI |

- ເອົາ `html{font-size:14px}` ອອກ → ກັບໄປ 16px (ຫຼື ຕັ້ງ scale ໃນ token).
- ນ້ຳໜັກ: ໃຊ້ສະເພາະ `font-normal` (400) ແລະ `font-bold` (700). **ຫ້າມ `font-black`**. ຖ້າຕ້ອງການ 500/600 ໃຫ້ໃຊ້ `NotoSansLao-Variable.ttf` ທີ່ມີຢູ່ແລ້ວ ແລະ ຕັ້ງ `font-weight: 100 900` ໃນ `@font-face`.
- ຕົວເລກ/ເງິນ: `tabular-nums`.
- ຕົວອັກສອນລາວມີສະຫຼະ/ວັນນະຍຸດເທິງ-ລຸ່ມ → ຫ້າມ `leading-none`/`leading-tight` ໃນຂໍ້ຄວາມລາວ.

### 5.3 Spacing / Radius / Elevation
- Spacing scale 4px; ຊ່ອງວ່າງ card `p-4` (mobile) / `p-6` (desktop).
- Radius: `rounded-lg` (input/ປຸ່ມ), `rounded-xl` (card), ຫ້າມປົນ `2xl` ນອກ hero.
- Shadow: ໃຊ້ `shadow-sm` ເປັນຄ່າຕັ້ງຕົ້ນ; `shadow-lg shadow-primary/25` ສະເພາະ CTA ຫຼັກ 1 ປຸ່ມຕໍ່ໜ້າ.
- **Stat card ມາດຕະຖານດຽວ**: ພື້ນຂາວ + border; ອະນຸຍາດ variant `highlight` (gradient) ໄດ້ **ພຽງ 1 ໃບຕໍ່ໜ້າ**.

### 5.4 Motion
- Transition 150–200ms; ເຄົາລົບ `prefers-reduced-motion` (ປິດ animation).
- **ຫ້າມ** `animate-pulse` ຖາວອນ; ໃຊ້ສະເພາະ skeleton loading ແລະ ຈຸດ notification ຄັ້ງດຽວ.

### 5.5 Dark mode
ຮັກສາໄວ້ (`dark:` class). ເກັບຄ່າໃນ `stores/ui.js` + `useCookie`. ມີ toggle ໃນ UserMenu. ທຸກ token ຕ້ອງມີຄູ່ dark.

### 5.6 Iconography
ໃຊ້ `material-icons` ຕໍ່ໄປ ຜ່ານ `<BaseIcon name="..."/>` (ບໍ່ໃສ່ `<span class="material-icons">` ກະແຈກກະຈາຍ) ເພື່ອຄວບຄຸມ size/aria ຢູ່ຈຸດດຽວ.

---

## 6. Responsive: Desktop / Tablet / Mobile

### 6.1 Breakpoint
| ອຸປະກອນ | ກວ້າງ | Tailwind | Layout | ການນຳທາງ |
|---|---|---|---|---|
| Mobile | < 768 | ຖານ | `mobile` | Top bar + **Bottom tab (4–5 ລາຍການ)** + Drawer ("ເພີ່ມເຕີມ") |
| Tablet | 768–1023 | `md:` | `admin` | **Icon rail** (72px) + tooltip; ກົດ ☰ ເປີດ Sidebar overlay |
| Desktop | ≥ 1024 | `lg:` | `admin` | **Sidebar ເຕັມ** (256px, ພັບໄດ້) + Header + Footer |

### 6.2 `useScreen()`
```js
// app/composables/useScreen.js
export const useScreen = () => {
  const bp = useBreakpoints({ tablet: 768, desktop: 1024 })
  const isDesktop = bp.greaterOrEqual('desktop')
  const isTablet  = bp.between('tablet', 'desktop')
  const isMobile  = bp.smaller('tablet')
  const form = computed(() =>
    isDesktop.value ? 'desktop' : isTablet.value ? 'tablet' : 'mobile')
  return { isDesktop, isTablet, isMobile, form }
}
```
ຕ້ອງການ `@vueuse/nuxt`. `ssr:false` → ບໍ່ມີ hydration mismatch.

### 6.3 ການເລືອກ Layout
```js
// app/plugins/layout.client.js
export default defineNuxtPlugin(() => {
  const { form } = useScreen()
  const route = useRoute()
  watch(form, (f) => {
    if (route.meta.layout === 'auth') return
    setPageLayout(f === 'mobile' ? 'mobile' : 'admin')
  }, { immediate: true })
})
```
- ແຕ່ລະໜ້າ: `definePageMeta({ layout: 'admin', title: '...', permission: '...' })` — ບໍ່ຕ້ອງຫໍ່ `<NuxtLayout>`.
- `login` → `layout: 'auth'`.

### 6.4 ຮູບແບບ View
```vue
<!-- pages/policies/index.vue -->
<script setup>
definePageMeta({ title: 'ຈັດການປະກັນໄພ', permission: 'policy.view' })
const { form } = useScreen()
const { items, pending, error, refresh, filters } = usePolicies()
const View = computed(() => resolveComponent(
  form.value === 'mobile' ? 'LazyFeaturePolicyListMobile' : 'LazyFeaturePolicyListDesktop'))
</script>
<template>
  <component :is="View" v-model:filters="filters"
             :items="items" :loading="pending" :error="error" @retry="refresh" />
</template>
```
- Prefix `Lazy` → code-split; mobile ບໍ່ໂຫຼດ code desktop.
- Tablet ໃຊ້ view Desktop (ຄ່າຕັ້ງຕົ້ນ); ແຍກ `*Tablet` ສະເພາະໜ້າທີ່ຈຳເປັນ.

### 6.5 ຕາຕະລາງ Matrix: ແຕ່ລະໜ້າໃຊ້ view ຫຍັງ
| ໜ້າ | Desktop | Tablet | Mobile |
|---|---|---|---|
| Dashboard | Grid KPI + chart | Grid 2 ຖັນ | KPI scroll ແນວນອນ + chart ຢ່າງງ່າຍ |
| ລາຍການ (policies, customers…) | `DataTable` (table) | `DataTable` (ຄອບຄຸມຖັນ) | `DataTable` ໂໝດ card list |
| ລາຍລະອຽດ | 2 ຖັນ (ຂໍ້ມູນ + timeline) | 2 ຖັນ | Tabs ແນວຕັ້ງ |
| ຟອມ/Wizard | ຟອມ 2 ຖັນ + stepper ຂ້າງ | ຄືກັນ | 1 ຖັນ, stepper ເທິງ, ປຸ່ມ sticky ລຸ່ມ |
| ການເລືອກ filter | FilterBar inline | inline | Bottom sheet |
| Modal | Modal ກາງ | Modal ກາງ | Bottom sheet / ເຕັມຈໍ |

### 6.6 Touch & ergonomics (Mobile/Tablet)
- ເປົ້າສຳຜັດ ≥ 44×44px; ຊ່ອງວ່າງລະຫວ່າງ ≥ 8px.
- ຮອງຮັບ safe-area (`env(safe-area-inset-*)`) ສຳລັບ Bottom tab / notch.
- Pull-to-refresh ສຳລັບລາຍການ (mobile); ຫຼີກລ່ຽງ hover-only interaction.
- `inputmode`/`type` ຖືກຕ້ອງ (`tel`, `numeric`, `email`).

---

## 7. ລາຍການ Components

### 7.1 Base (ພື້ນຖານ, ບໍ່ຮູ້ຈັກ business)
| Component | Props ຫຼັກ | ໝາຍເຫດ |
|---|---|---|
| `BaseButton` | `variant` (primary/secondary/ghost/danger), `size`, `loading`, `icon`, `block` | ມີ spinner, `aria-busy` |
| `BaseInput` | `v-model`, `type`, `label`, `error`, `hint`, `prefixIcon`, `suffix` | show/hide password ໃນຕົວ |
| `BaseSelect` / `BaseTextarea` / `BaseCheckbox` / `BaseRadio` / `BaseSwitch` | ຄ້າຍ Input | ເຊື່ອມ `FormField` |
| `BaseBadge` | `tone` (success/warning/danger/info/neutral) | |
| `BaseAvatar` | `src`, `name` | fallback initials (ບໍ່ພຶ່ງຮູບນອກ) |
| `BaseCard` | `padding`, `as` | |
| `BaseModal` / `BaseDrawer` | `v-model`, `size` | focus-trap, Esc, ເປັນ bottom-sheet ໃນ mobile |
| `BaseDropdown` | slot trigger/menu | `aria-expanded`, Esc, click-outside (`onClickOutside`) |
| `BaseTabs` | `items`, `v-model` | |
| `BaseSkeleton` / `BaseSpinner` | | |
| `BaseIcon` | `name`, `size` | wrapper ຂອງ material-icons |

### 7.2 UI (ຮູ້ຈັກ pattern ຂອງລະບົບ)
| Component | ໜ້າທີ່ |
|---|---|
| `PageHeader` | ຫົວຂໍ້ + ຄຳອະທິບາຍ + slot actions + breadcrumb |
| `StatCard` | ຕົວເລກ KPI, trend, variant `highlight`, ສະຖານະ loading |
| `StatusBadge` | map ສະຖານະ (pending/active/expired/claim…) → tone + ຂໍ້ຄວາມລາວ |
| `DataTable` | `columns, rows, loading, error, selectable, sort, pagination`; slot `#cell-<key>`, `#actions`; desktop=table, mobile=card; skeleton/empty/error ໃນຕົວ |
| `FilterBar` / `SearchInput` | tabs + search (debounce) + filter ເພີ່ມ; mobile → bottom sheet |
| `Pagination` | page/pageSize; ຍ່ອເປັນ "ກ່ອນ/ຖັດໄປ" ໃນ mobile |
| `EmptyState` / `ErrorState` | icon + ຂໍ້ຄວາມ + ປຸ່ມ (ລອງໃໝ່ / ສ້າງໃໝ່) |
| `FormField` | label + control + error + hint + required mark |
| `FileUpload` | drag-drop/ກ້ອງ, preview, ຈຳກັດຂະໜາດ/ຊະນິດ (mock) |
| `Stepper` | horizontal (desktop) / compact (mobile) |
| `ConfirmDialog` + `useConfirm()` | ຢືນຢັນການລຶບ/ຍົກເລີກ |
| `ToastHost` + `useToast()` | ແຈ້ງສຳເລັດ/ຜິດພາດ |
| `DateRangePicker` | filter ວັນທີ (ຮູບແບບ `dd/mm/yyyy`) |

### 7.3 Shell
| Component | Desktop | Tablet | Mobile |
|---|---|---|---|
| `AppSidebar` | ✅ ເຕັມ/ພັບ | overlay | – |
| `AppRail` | – | ✅ | – |
| `AppHeader` | ✅ (search, ກະດິ່ງ, user) | ✅ | ແບບຍ່ອ (title + ກະດິ່ງ) |
| `BottomTabBar` | – | – | ✅ (ອ່ານຈາກ navigation, ກອງຕາມ role) |
| `MobileDrawer` | – | – | ✅ ("ເພີ່ມເຕີມ") |
| `GlobalSearch` | ⌘K palette | ✅ | ໜ້າຕ່າງເຕັມຈໍ |
| `UserMenu` / `NotificationMenu` | dropdown | dropdown | sheet |
| `AppFooter` | ✅ | – | – |

### 7.4 Feature (business)
`PolicyListDesktop/Mobile`, `PolicyWizard` (ລວມ `PurchaseWizard` + `policies/create`), `PolicyDetail`, `CustomerForm`, `ClaimForm`, `QuotationForm`, `KpiRow`, `RevenueChart`, `PolicyDonut`, `RecentActivity`, `CommissionSummary`, `TeamTree` …

### 7.5 ຂໍ້ກຳນົດຂອງທຸກ component
- ມີ `aria-*`/role ຖືກຕ້ອງ; ໃຊ້ໄດ້ດ້ວຍແປ້ນພິມ.
- ຮອງຮັບ dark mode.
- ບໍ່ຝັງສີ/ຂະໜາດຕົງໆນອກ token.
- ມີ story ຕົວຢ່າງໃນໜ້າ `/_dev/components` (ສະເພາະ dev) ເພື່ອທົດສອບຕາຮູບຮ່າງທຸກ state.

---

## 8. Mock Data & Data Layer

### 8.1 ຫຼັກການ
- Composable ເປັນ interface ດຽວ; ຂ້າງໃນສະຫຼັບ mock ↔ `$fetch` ດ້ວຍ `runtimeConfig.public.useMock`.
- Mock ຈຳລອງ: **delay 300–800ms**, pagination, sort, filter, search, ຄວາມຜິດພາດສຸ່ມ (ເປີດໄດ້ດ້ວຍ flag), ຂໍ້ມູນຫວ່າງ.
- ຂໍ້ມູນເປັນລາວສົມຈິງ: ຊື່ລາວ, ເບີ `020 xxxx xxxx`, ທະບຽນລົດ `ກກ 1234`, ວົງເງິນ ₭, ບໍລິສັດປະກັນ (DHP, APA…), ວັນທີ `dd/mm/yyyy`.
- Seed ຄົງທີ່ (deterministic) ເພື່ອໃຫ້ screenshot/test ຄືເກົ່າ; ໃຊ້ `@faker-js/faker` ພ້ອມ seed ຫຼື JSON ຄົງທີ່.

### 8.2 ສັນຍາ (Contract)
```js
// ທຸກ list composable ສົ່ງຄືນ
{ items, total, page, pageSize, pending, error, refresh, filters /* ref */ }
// ທຸກ mutation
{ execute(payload), pending, error }   // create / update / remove
```
Shape ຂອງ entity ອະທິບາຍດ້ວຍ JSDoc `@typedef` ໃນ `mocks/*.js` (ອ້າງອີງ schema ໃນ `Project.txt`).

### 8.3 Entities (ອີງ `Project.txt`)
| Entity | ຟິວຫຼັກ |
|---|---|
| User | id, name, email, phone, role, status, avatar |
| Customer | id, firstName, lastName, dob, gender, address, idCard/passport, occupation, phone |
| Agent | id, code (`SB_001`), userId, creditLimit, salesTarget, commissionRate (5%), taxRate, teamId |
| Company | code (DHP/APA), name, contact, logo |
| Product | id, companyId, name, type (Motor/Health/Fire/Accident), description |
| Vehicle | customerId, make, model, year, plate, engineNo, chassisNo, cc, color, usage |
| Policy | number, customerId, agentId?, vehicleId, companyId, startDate, endDate, netPremium, vat (7%), registrationFee, totalPremium, status (pending/active/expired/cancelled) |
| Quotation | id, customerId, productId, premium, validUntil, status |
| Claim | id, policyId, type, incidentDate, amount, status, attachments |
| Commission | id, agentId, policyId, rate, amount, status (pending/paid), paidAt |
| Invoice / Payment | id, policyId, amount, dueDate, status, method, paidAt |
| Dashboard | KPI, ຍອດຂາຍລາຍເດືອນ, ສັດສ່ວນຕາມຜະລິດຕະພັນ, ກິດຈະກຳລ່າສຸດ |

### 8.4 ເຄື່ອງມືຮ່ວມ
`useFormat()`: `currency(n)` → `₭ 12,850,000`, `date(d)` → `dd/mm/yyyy`, `phone(s)`, `number(n)`. **ຫ້າມ** format ເອງໃນ markup.

---

## 9. Auth, Role & Permission

### 9.1 Flow (ຈຳລອງ)
1. Login → `useAuth().login(username, password)` ກວດກັບ `mocks/users.js` (ມີຜູ້ໃຊ້ທົດສອບແຕ່ລະ role; ເກັບໃນ seed, **ບໍ່ສະແດງໃນ chat/log**).
2. ສຳເລັດ → `stores/auth` ເກັບ `user, token, role`; persist ດ້ວຍ `useCookie` (web) / Capacitor Preferences (native); "ຈົດຈຳ" ກຳນົດອາຍຸ.
3. `middleware/auth.global.js`: ບໍ່ login → `/login?redirect=...`; login ແລ້ວເຂົ້າ `/login` → redirect `/dashboard`.
4. `middleware/permission.js`: ກວດ `route.meta.permission` ຕາມ `config/permissions.js`; ບໍ່ມີສິດ → ໜ້າ 403.
5. Logout → clear store + cookie + `navigateTo('/login')`.
6. Landing ຕາມ role: admin/staff → `/dashboard`; agent/customer (mobile) → ໜ້າ home ມືຖື.

### 9.2 Login page — ຕ້ອງແກ້
- **ລຶບ `console.log` ລະຫັດຜ່ານ ທັນທີ** (U2).
- Error state (ຜິດ username/password), disabled ຕອນ loading, show/hide password, ລືມລະຫັດ (ໜ້າຈຳລອງ), ລັອກຫຼັງຜິດ N ຄັ້ງ (mock).
- Validation ດ້ວຍ `validators.js`.

### 9.3 Permission matrix (ຮ່າງ — ຢືນຢັນກັບທີມ)
| ໂມດູນ | admin | staff | agent | customer |
|---|:-:|:-:|:-:|:-:|
| Dashboard | ✅ | ✅ | ✅ (ຂອງຕົນ) | – |
| ປະກັນໄພ | CRUD | CRUD | ສ້າງ/ເບິ່ງຂອງຕົນ | ເບິ່ງຂອງຕົນ |
| ສະເໜີລາຄາ | CRUD | CRUD | CRUD | ຂໍ/ເບິ່ງ |
| ລູກຄ້າ | CRUD | CRUD | ຂອງຕົນ | ຂໍ້ມູນຕົນ |
| ຕົວແທນ/ທີມ | CRUD | ເບິ່ງ | ທີມຕົນ | – |
| ຄອມມິດຊັ່ນ | CRUD | ເບິ່ງ | ຂອງຕົນ | – |
| ເຄມ | CRUD | CRUD | ແຈ້ງ/ເບິ່ງ | ແຈ້ງ/ເບິ່ງ |
| ການເງິນ | CRUD | CRUD | – | ຊຳລະຂອງຕົນ |
| ລາຍງານ | ✅ | ✅ | ຂອງຕົນ | – |
| ຜູ້ໃຊ້/ຕັ້ງຄ່າ | ✅ | – | – | – |

---

## 10. ແຜນເປັນ Phase

ໝາຍເຫດ: ການປະເມີນເວລາເປັນ **ຄາດຄະເນສຳລັບນັກພັດທະນາ 1 ຄົນ**; ປັບຕາມຂະໜາດທີມ.

### Phase 0 — Foundation & Tooling (≈ 1–2 ມື້)
- [ ] ຕິດຕັ້ງ `@vueuse/nuxt`, `eslint` + `@nuxt/eslint`, `prettier`, `vitest` + `@vue/test-utils`, `playwright`.
- [ ] ລຶບ alias `konsta/vue` ທີ່ຊີ້ຕົວເອງ; ກວດ `transpile`.
- [ ] ຂຽນ `README.md` ຂອງ client (setup, scripts, ໂຄງສ້າງ, convention).
- [ ] ຍ້າຍ asset ພາຍນອກ → `assets/img` (auth-bg, avatar placeholder, logo).
- [ ] **ລຶບ `console.log` ລະຫັດຜ່ານໃນ `login.vue`**.
- [ ] ສ້າງ `docs/glossary.md` (ຄຳສັບລາວມາດຕະຖານ: ປະກັນໄພ, ເຄມ/ສິນໄໝ, ຕົວແທນ, ຄອມມິດຊັ່ນ…) ໃຫ້ທີມຢືນຢັນ.
- **ຜ່ານເມື່ອ**: `npm run dev`, `lint`, `test` ເຮັດວຽກ; ບໍ່ມີ asset ພາຍນອກ.

### Phase 1 — Design Tokens & Typography (≈ 1 ມື້)
- [ ] `tokens.css`: ສີ semantic, typography scale, radius, shadow (§5).
- [ ] ແກ້ `main.css`: font-size, ເພີ່ມ Variable font (ຖ້າໃຊ້), `prefers-reduced-motion`.
- [ ] ກຳນົດ lint rule ຫ້າມສີດິບ / `font-black` / `text-[10px]`.
- **ຜ່ານເມື່ອ**: ໜ້າ `/_dev/tokens` ສະແດງ palette + typography ທັງ light/dark; contrast ຜ່ານ AA.

### Phase 2 — Shell, Layouts & Responsive Core (≈ 3–4 ມື້)
- [ ] `useScreen`, `plugins/layout.client.js`, `stores/ui`.
- [ ] `config/navigation.js` + `useNavigation` (ກອງ role, breadcrumb, title ຈາກ `route.meta`).
- [ ] `layouts/auth|admin|mobile`.
- [ ] Shell: `AppSidebar` (full/collapse), `AppRail`, `AppHeader`, `AppFooter`, `BottomTabBar`, `MobileDrawer`, `UserMenu`, `NotificationMenu`, `Breadcrumb`.
- [ ] `error.vue` (404/403/500).
- [ ] ແກ້ປຸ່ມ ☰ ໃຫ້ເຮັດວຽກ; ລຶບ `animate-pulse` ຖາວອນ; ເພີ່ມ `aria-*`.
- **ຜ່ານເມື່ອ**: ປ່ຽນຂະໜາດຈໍ 375 → 768 → 1280 ແລ້ວ shell ປ່ຽນຖືກຕ້ອງໂດຍບໍ່ reload; Sidebar ບໍ່ remount ເວລາປ່ຽນໜ້າ.

### Phase 3 — Base & UI Components (≈ 4–5 ມື້)
- [ ] Base ທັງໝົດ (§7.1) + ໜ້າ `/_dev/components`.
- [ ] UI: `PageHeader`, `StatCard`, `StatusBadge`, `FilterBar`, `SearchInput`, `Pagination`, `EmptyState`, `ErrorState`, `FormField`, `ConfirmDialog`, `ToastHost`, `DataTable` (table + card mode).
- [ ] `useToast`, `useConfirm`, `useFormat`, `validators`.
- [ ] Unit test ສຳລັບ `DataTable`, `BaseModal`, `BaseDropdown`, `useFormat`.
- **ຜ່ານເມື່ອ**: ທຸກ component ມີ state (default/hover/focus/disabled/loading/error) + dark; ໃຊ້ແປ້ນພິມໄດ້.

### Phase 4 — Mock Layer & Auth (≈ 3 ມື້)
- [ ] `mocks/_helpers.js` + mock ທຸກ entity (§8.3) ເປັນພາສາລາວ.
- [ ] Composables `api/*` ຕາມສັນຍາ (§8.2) + `runtimeConfig.public.useMock`.
- [ ] `stores/auth`, `useAuth`, middleware `auth.global` + `permission`, ໜ້າ 403.
- [ ] ປັບ `login.vue` (§9.2); Header/UserMenu ອ່ານຈາກ store.
- **ຜ່ານເມື່ອ**: login ຕາມ role ໄດ້ເມນູ/ສິດຕ່າງກັນ; refresh ແລ້ວຍັງ login; logout ລ້າງຄົບ; ເຂົ້າ URL ບໍ່ມີສິດ → 403.

### Phase 5 — Reference Page: Policies ຄົບ 3 ຮູບແບບ (≈ 3 ມື້)
- [ ] `pages/policies/index.vue` + `PolicyListDesktop` + `PolicyListMobile` (filter bottom-sheet, pull-to-refresh).
- [ ] `PolicyDetail` (`pages/policies/[id].vue`).
- [ ] `PolicyWizard` ລວມ `PurchaseWizard` + `policies/create` (§11.2) + validation + draft.
- [ ] ສະແດງ loading/empty/error ຄົບ.
- **ຜ່ານເມື່ອ**: ໜ້ານີ້ເປັນ **ແມ່ແບບ**; ທີມກວດ UX ຢູ່ 3 ຂະໜາດຈໍ; ຂຽນ "Page Recipe" ໃນ `docs/`.

### Phase 6 — ຍ້າຍໜ້າທີ່ເຫຼືອ (≈ 5–7 ມື້)
ລຳດັບ: Dashboard → ລູກຄ້າ → ສະເໜີລາຄາ → ເຄມ → ຕົວແທນ/ທີມ → ຄອມມິດຊັ່ນ → ການເງິນ (invoice/payment) → ລາຍງານ → ຜູ້ໃຊ້ → ຕັ້ງຄ່າ.
- [ ] ທຸກໜ້າໃຊ້ `PageHeader`/`DataTable`/`StatCard`, ລຶບ wrapper `NuxtLayout` ແລະ `layout:false`.
- [ ] Dashboard: `KpiRow`, ກຣາຟ (ເລືອກ lib ເບົາ, ເຊັ່ນ `chart.js`/`vue-chartjs` ຫຼື SVG ເອງ), ມີ mobile variant.
- [ ] ໜ້າ mobile ສຳລັບ role `agent`/`customer` (home, ປະກັນໄພຂອງຂ້ອຍ, ຊື້ປະກັນ, ເຄມ, ຄອມມິດຊັ່ນ, ໂປຣໄຟລ໌).
- [ ] ແທນ `MobileHome` ແບບ welcome ດ້ວຍ home ທີ່ມີ shortcut + ສະຫຼຸບ.
- **ຜ່ານເມື່ອ**: ບໍ່ມີ `layout:false`, ບໍ່ມີສີດິບ, ບໍ່ມີ "Data Loading" ຄົງທີ່; ທຸກໜ້າຜ່ານ checklist §17.

### Phase 7 — A11y, i18n, Polish (≈ 2–3 ມື້)
- [ ] ກວດ a11y (axe) ທຸກໜ້າ; ແກ້ contrast, focus ring, aria.
- [ ] ຕັດສິນໃຈ i18n (§12): ຕິດ `@nuxtjs/i18n` ຫຼື ໃຊ້ glossary ເທົ່ານັ້ນ.
- [ ] Global search (⌘K), keyboard shortcut.
- [ ] Performance: ກວດ bundle (ຍ່ອຍ chunk), lazy route/component, font preload.

### Phase 8 — Capacitor & QA (≈ 2–3 ມື້)
- [ ] `nuxt generate` → `npx cap sync`; ທົດສອບ iOS Simulator + Android Emulator.
- [ ] Safe-area, status bar, splash, icon, back-button Android, keyboard overlap.
- [ ] Offline smoke test (ບໍ່ມີ asset ພາຍນອກ).
- [ ] Regression ເທິງ Chrome/Safari/Firefox; e2e Playwright ຫຼັກ.

**ລວມຄາດຄະເນ**: ≈ 24–32 ມື້ທຳງານ (1 ຄົນ).

### Milestone
| M | ເນື້ອໃນ | Phase |
|---|---|---|
| M1 | Design system + Shell ໃຊ້ງານໄດ້ 3 ຂະໜາດຈໍ | 0–3 |
| M2 | Auth + Mock + ໜ້າ Policies ເປັນແມ່ແບບ | 4–5 |
| M3 | ທຸກໜ້າຍ້າຍສຳເລັດ | 6 |
| M4 | A11y/Perf/Native ພ້ອມ demo | 7–8 |

---

## 11. ແຜນທີ່ໜ້າ (Page Map)

### 11.1 Routes
| Route | Layout | Permission | ໝາຍເຫດ |
|---|---|---|---|
| `/login`, `/forgot-password` | auth | public | |
| `/` | – | auth | redirect ຕາມ role/ອຸປະກອນ |
| `/dashboard` | admin/mobile | `dashboard.view` | KPI + chart |
| `/policies` · `/policies/create` · `/policies/[id]` | admin/mobile | `policy.*` | Wizard + detail |
| `/quotations` · `/[id]` · `/create` | admin/mobile | `quotation.*` | |
| `/customers` · `/[id]` | admin/mobile | `customer.*` | ເພີ່ມ detail |
| `/claims` · `/create` · `/[id]` | admin/mobile | `claim.*` | |
| `/agents` · `/[id]` · `/teams` | admin | `agent.*` | |
| `/commissions` | admin/mobile | `commission.view` | |
| `/finance/invoices` · `/finance/payments` | admin | `finance.*` | |
| `/reports` | admin | `report.view` | |
| `/users` · `/settings` | admin | `admin.*` | |
| `/profile` | all | auth | ໃໝ່ |
| `/_dev/tokens`, `/_dev/components` | – | dev only | |

### 11.2 PolicyWizard (ລວມ 2 ຊຸດ)
ຂັ້ນຕອນ (ຕາມ `Project.txt`):
1. ຂໍ້ມູນຜູ້ເອົາປະກັນ (ຊື່, ເບີ, ທີ່ຢູ່, DOB, ເພດ, ອັບໂຫຼດບັດ/ພາສປອດ)
2. ຂໍ້ມູນລົດ (ປະເພດ, ຍີ່ຫໍ້, ລຸ້ນ, ທະບຽນ, ເລກຈັກ/ຖັງ, cc, ທີ່ນັ່ງ, ການໃຊ້ງານ)
3. ເລືອກແພັກເກດ/ບໍລິສັດປະກັນ + ຄິດເບ້ຍ (net + VAT 7% + ຄ່າທະບຽນ)
4. ສະຫຼຸບ & ຢືນຢັນ
5. ຊຳລະເງິນ (mock)
6. ສຳເລັດ + ດາວໂຫຼດ/ແຊຣ໌ເອກະສານ (mock)

ຄຸນສົມບັດ: ເກັບ state ໃນ `useState`/store, validate ທີລະຂັ້ນ, ບັນທຶກຮ່າງອັດຕະໂນມັດ, ກັບຄືນແກ້ໄຂໄດ້, ເຕືອນເມື່ອອອກກາງຄັນ, desktop = stepper ຂ້າງ + ຟອມ 2 ຖັນ, mobile = 1 ຖັນ + ປຸ່ມ sticky.

### 11.3 Navigation (ມືຖື)
Bottom tab ຕາມ role:
- `agent`: ໜ້າຫຼັກ · ປະກັນໄພ · ຂາຍ (+) · ຄອມມິດຊັ່ນ · ເພີ່ມເຕີມ
- `customer`: ໜ້າຫຼັກ · ປະກັນໄພຂອງຂ້ອຍ · ຊື້ປະກັນ · ເຄມ · ໂປຣໄຟລ໌

---

## 12. Accessibility & i18n

### 12.1 A11y (ເປົ້າ WCAG 2.1 AA)
- [ ] ທຸກ icon button ມີ `aria-label`; dropdown ມີ `aria-expanded`/`aria-haspopup`; Esc ປິດ.
- [ ] Focus ring ເຫັນຊັດ; focus-trap ໃນ modal/drawer; ຄືນ focus ຫຼັງປິດ.
- [ ] Contrast ຂໍ້ຄວາມ ≥ 4.5:1 (ແກ້ `slate-400` → `text-muted`).
- [ ] ຕາຕະລາງມີ `<th scope>`/caption; card list ມີ role ທີ່ເໝາະ.
- [ ] ຟອມ: label ຜູກກັບ input, error ຜ່ານ `aria-describedby`/`aria-live`.
- [ ] ເຄົາລົບ `prefers-reduced-motion`; ບໍ່ໃຊ້ສີເປັນຕົວບົ່ງບອກຢ່າງດຽວ.

### 12.2 i18n
ເລືອກ 1 ຢ່າງ (ຕົກລົງໃນ §16):
- **A (ແນະນຳຖ້າຈະມີຫຼາຍພາສາ)**: `@nuxtjs/i18n`, `locales/lo.json` ເປັນຫຼັກ, `en.json` ສຳຮອງ; ທຸກ string ຜ່ານ `t()`.
- **B (ຖ້າລາວພາສາດຽວ)**: ຮວມ string ໃນ `utils/glossary.js`; ລຶບຄຳອັງກິດຈາກ UI (ຍົກເວັ້ນຊື່ແບຣນດ໌/ຄຳສັບທາງເຕັກນິກທີ່ຕົກລົງ).

ທັງສອງແບບ: ວັນທີ `dd/mm/yyyy`, ເງິນ `₭ 1,000,000`, ເບີ `020 xxxx xxxx`.

---

## 13. Capacitor (Android/iOS)

- `webDir: .output/public` → ໃຊ້ `nuxt generate` ກ່ອນ `cap sync`.
- Scripts ເພີ່ມ: `"cap:sync": "nuxt generate && cap sync"`, `"cap:android"`, `"cap:ios"`.
- ສະຖານະ: ລະບຸ plugin ທີ່ຕ້ອງການ — `@capacitor/preferences` (token), `@capacitor/status-bar`, `@capacitor/splash-screen`, `@capacitor/app` (back button), `@capacitor/keyboard`, `@capacitor/camera` (ບັດ/ເອກະສານ).
- `*.client.js` plugin ສຳລັບການເຂົ້າເຖິງ native; ກວດ `Capacitor.isNativePlatform()`.
- Safe-area CSS, `viewport-fit=cover`, ປິດ pull-to-refresh ຂອງ browser ເມື່ອໃຊ້ຂອງ app.
- ບໍ່ພຶ່ງ CDN/ຮູບນອກ; font ຢູ່ໃນ bundle.
- ຂັ້ນຕອນ release (icon/splash/signing) ຢູ່ນອກຂອບເຂດຮອບນີ້ ແຕ່ຕ້ອງ build ໄດ້.

---

## 14. ການທົດສອບ ແລະ ຄຸນນະພາບ

| ລະດັບ | ເຄື່ອງມື | ເປົ້າໝາຍ |
|---|---|---|
| Lint/Format | ESLint + Prettier | ຜ່ານ 100%, rule ຫ້າມສີດິບ/`font-black` |
| Unit | Vitest + Vue Test Utils | composables (`useFormat`, `useScreen`, mock helpers), Base/UI components ຫຼັກ (≥ 70% ໃນ `components/base|ui`, `composables`) |
| Component states | ໜ້າ `/_dev/components` | ກວດສາຍຕາ ທຸກ state × light/dark |
| E2E | Playwright (viewport 375/768/1280) | login → ສ້າງປະກັນໄພ (wizard) → ເບິ່ງລາຍການ; ກວດ guard/role |
| A11y | `axe` (Playwright) | 0 serious/critical |
| Performance | Lighthouse (mobile) | Perf ≥ 85, ບໍ່ມີ layout shift ໃຫຍ່ |
| Native | iOS Sim + Android Emu | smoke test ທຸກ flow ຫຼັກ |

**Checklist ຕໍ່ໜ້າ (Page Recipe)**
- [ ] ໃຊ້ `definePageMeta` (`layout`, `title`, `permission`); ບໍ່ມີ wrapper
- [ ] ຂໍ້ມູນຜ່ານ `useXxx()`; ມີ loading / empty / error
- [ ] ໃຊ້ `PageHeader`, `StatCard`, `DataTable` (ບໍ່ຂຽນຕາຕະລາງເອງ)
- [ ] ບໍ່ມີສີດິບ, `font-black`, `text-[10-11px]`, hard-code ເງິນ/ວັນທີ
- [ ] ກວດ 375 / 768 / 1280, light + dark
- [ ] ໃຊ້ແປ້ນພິມໄດ້; ຜ່ານ axe
- [ ] ຂໍ້ຄວາມຜ່ານ glossary/i18n

---

## 15. ຄວາມສ່ຽງ ແລະ ການຮັບມື

| ຄວາມສ່ຽງ | ໂອກາດ | ຜົນ | ການຮັບມື |
|---|---|---|---|
| Konsta ຂັດກັບ Tailwind 4 / Nuxt 4 (transpile, `k-app` theme) | ກາງ | ກາງ | ຈຳກັດໃນ `layouts/mobile`; spike ໃນ Phase 2; ສຳຮອງ = Base ຂອງເຮົາເອງ |
| Layout ປ່ຽນກາງຄັນເມື່ອ resize ເຮັດໃຫ້ state ຫາຍ | ກາງ | ກາງ | state ຢູ່ໃນ Pinia/`useState`, ບໍ່ຢູ່ໃນ layout |
| Mock shape ບໍ່ກົງກັບ API ຈິງ | ສູງ | ກາງ | ກຳນົດ contract ຮ່ວມກັບ `server/` ກ່ອນ Phase 6; JSDoc typedef |
| ຕົວອັກສອນລາວ render ຜິດ (ວັນນະຍຸດຊ້ອນ, `font-black`) | ກາງ | ຕ່ຳ | ໃຊ້ weight 400/700 ຫຼື Variable; ກວດ line-height |
| ຂອບເຂດບວມ (ໜ້າຫຼາຍ, 2 UX ຕ່າງກັນ) | ສູງ | ສູງ | ຕົກລົງ persona/mobile scope (§16) ກ່ອນ; ເຮັດ policies ເປັນແມ່ແບບກ່ອນ |
| Chart lib ໃຫຍ່ເຮັດໃຫ້ bundle ໜັກໃນມືຖື | ກາງ | ກາງ | lazy-load; ໃຊ້ lib ເບົາ/SVG |
| ຄຳສັບລາວບໍ່ຄົງທີ່ | ສູງ | ຕ່ຳ | glossary ທີ່ທີມຢືນຢັນໃນ Phase 0 |
| ປະສິດທິພາບ WebView ເກົ່າ (Android) | ກາງ | ກາງ | ທົດສອບເຄື່ອງ low-end; ຫຼີກ blur/shadow ໜັກ |

---

## 16. ສິ່ງທີ່ຕ້ອງຕົກລົງກ່ອນເລີ່ມ

| # | ຄຳຖາມ | ຕົວເລືອກ / ຄ່າແນະນຳ | ຜົນກະທົບ |
|---|---|---|---|
| Q1 | ຜູ້ໃຊ້ມືຖືຄືໃຜ? | (a) ສະເພາະ agent/customer ໜ້າຈຳກັດ **(ແນະນຳ)** · (b) admin ໃຊ້ໄດ້ທຸກເມນູ | ຈຳນວນໜ້າ mobile |
| Q2 | Tablet ໃຊ້ shell ຫຍັງ? | Admin + Icon Rail **(ແນະນຳ)** · ຫຼື shell ມືຖື | Phase 2 |
| Q3 | i18n | A: `@nuxtjs/i18n` · B: glossary ພາສາລາວດຽວ | Phase 7 |
| Q4 | ຍັງໃຊ້ Konsta ບໍ? | ໃຊ້ໃນ `mobile` layout ເທົ່ານັ້ນ **(ແນະນຳ)** · ຫຼື ເອົາອອກ ໃຊ້ Base ຂອງເຮົາທັງໝົດ | ຄວາມສອດຄ່ອງ vs ຄວາມຮູ້ສຶກ native |
| Q5 | Chart library | `vue-chartjs` · `apexcharts` · SVG ເອງ | bundle |
| Q6 | Permission matrix (§9.3) | ຢືນຢັນ/ແກ້ໄຂ | middleware, ເມນູ |
| Q7 | ຄຳສັບ (ປະກັນໄພ / ເຄມ…) | ຢືນຢັນ glossary | ທຸກໜ້າ |
| Q8 | ຍ້າຍເປັນ TypeScript? | ບໍ່ (ຮອບນີ້) **(ແນະນຳ)** · ຫຼື ແມ່ນ | ຕົ້ນທຶນ |
| Q9 | ຮູບແບບ API ຈິງ (REST/Laravel Sanctum?) | ກຳນົດກັບທີມ `server/` | contract ຂອງ mock |

---

## 17. Definition of Done

**ຕໍ່ໜ້າ/Component**
- ຜ່ານ Page Recipe checklist (§14).
- ເຮັດວຽກ 3 ຂະໜາດຈໍ + light/dark ໂດຍບໍ່ມີ horizontal scroll ທີ່ບໍ່ຕັ້ງໃຈ.
- ມີ loading / empty / error.
- ບໍ່ມີ lint error, test ຜ່ານ.

**ຕໍ່ໂປຣເຈັກ (ສຳເລັດຮອບນີ້)**
- ທຸກໜ້າໃນ §11.1 ເຮັດວຽກດ້ວຍ mock; ສະຫຼັບ `useMock=false` ແລ້ວມີຈຸດຕໍ່ API ຊັດເຈນ.
- Auth + role + guard ຄົບ; ບໍ່ມີ credential ໃນ log/ໂຄດ.
- ບໍ່ມີ asset ພາຍນອກ; app ເປີດໄດ້ offline ໃນ Capacitor (iOS + Android).
- axe 0 serious/critical; Lighthouse mobile Perf ≥ 85.
- ເອກະສານ: README, glossary, Page Recipe, Component catalog (`/_dev/components`) ຄົບ.

---

### ພາກຜະໜວກ A — ສະຫຼຸບຄ່າຕັ້ງຄ່າທີ່ຈະປ່ຽນໃນ `nuxt.config.js`
```js
export default defineNuxtConfig({
  ssr: false,
  modules: ['@pinia/nuxt', '@nuxtjs/device', '@vueuse/nuxt', '@nuxt/eslint'],
  // ພິຈາລະນາ: '@nuxtjs/i18n' (Q3)
  runtimeConfig: { public: { useMock: true, apiBase: '' } },
  components: [
    { path: '~/components/feature', pathPrefix: false },  // <PolicyWizard/> ແທນ <FeaturePolicyWizard/>
    '~/components',
  ],
  app: { pageTransition: { name: 'page', mode: 'out-in' } },
  build: { transpile: ['konsta'] },                       // ລຶບ alias ທີ່ຊີ້ຕົວເອງ
  vite: { plugins: [tailwindcss()], optimizeDeps: { include: ['konsta', 'konsta/vue', 'material-icons'] } },
})
```

### ພາກຜະໜວກ B — ສະຖານະ "ແກ້ແລ້ວ" ຕໍ່ບັນຫາ §1.3 (ຕິດຕາມ)
| ບັນຫາ | Phase ທີ່ແກ້ |
|---|---|
| U2, C1, U6 | 0 |
| D1, D3, A2 (ບາງສ່ວນ) | 1 |
| L1, L2, L3, U4(layout), U8, U9, A1, A3 | 2 |
| D2, D5, A1/A2 (ຕໍ່) | 3 |
| U1, U3, U4, U5, D4(ບາງສ່ວນ) | 4 |
| U7, F1 | 5–6 |
| D4, A1–A3 (ສຸດທ້າຍ) | 7 |
