# ແຜນປັບປຸງ Logic ແລະ ສະຖາປັດຕະຍະກຳ Tenant Application (`client/`)
> **ເອກະສານແຜນປະຕິບັດງານລະອຽດ (Actionable Implementation Plan)**  
> **ຈຸດປະສົງ:** ແກ້ໄຂ Bugs ຄວາມຖືກຕ້ອງຂອງຂໍ້ມູນ, ອຸດຊ່ອງຫວ່າງຄວາມປອດໄພ, ເຊື່ອມຕໍ່ຟອມທີ່ຍັງຄ້າງ, ແລະ ຍົກລະດັບ UX/UI ຕາມມາດຕະຖານ Enterprise.

---

## 📑 ສາລະບານ (Table of Contents)
1. [ພາບລວມ ແລະ ຫຼັກການ (Guiding Principles)](#1-ພາບລວມ-ແລະ-ຫຼັກການ)
2. [ໄລຍະ 1: Core Security & Multi-Tenancy Resolution](#ໄລຍະ-1-core-security--multi-tenancy-resolution)
3. [ໄລຍະ 2: ແກ້ໄຂ Data Integrity Bugs ໃນ Policy & Claims](#ໄລຍະ-2-ແກ້ໄຂ-data-integrity-bugs-ໃນ-policy--claims)
4. [ໄລຍະ 3: ເຊື່ອມຕໍ່ຟອມ ແລະ Workflows ທີ່ຍັງຄ້າງ (Replace Placeholders)](#ໄລຍະ-3-ເຊື່ອມຕໍ່ຟອມ-ແລະ-workflows-ທີ່ຍັງຄ້າງ)
5. [ໄລຍະ 4: ມາດຕະຖານ Analytics, URL Query Sync & Modal UX](#ໄລຍະ-4-ມາດຕະຖານ-analytics-url-query-sync--modal-ux)
6. [ຕາຕະລາງກວດສອບຄວາມສຳເລັດ (Acceptance Checklist)](#ຕາຕະລາງກວດສອບຄວາມສຳເລັດ)

---

## 1. ພາບລວມ ແລະ ຫຼັກການ
- **Strict Multi-Tenancy:** ທຸກ API Call ຕ້ອງມີ `X-Tenant: <slug>` ແລະ Token ຖືກຕ້ອງ.
- **Zero Silent Data Loss:** ຂໍ້ມູນທີ່ຜູ້ໃຊ້ປ້ອນໃນ Form ຕ້ອງຖືກສົ່ງໄປບັນທຶກໃນ Database ຄົບຖ້ວນ 100% (ຫ້າມ Hardcode ຫຼື ຖິ້ມ Field ປະ).
- **Graceful Error Handling:** ເມື່ອ Token ໝົດອາຍຸ ຫຼື Session ຫຼຸດ ຕ້ອງ Auto-Redirect ໄປ Login ພ້ອມ Query Return URL ໂດຍບໍ່ຄ້າງ State.
- **Standard UI/UX:** Modal ທຸກອັນຕ້ອງໃຊ້ Bootstrap Modal Slide-from-Top (`modal modal-top fade`).

---

## ໄລຍະ 1: Core Security & Multi-Tenancy Resolution

### 1.1 ສ້າງ 401 Unauthorized Interceptor
- **ໄຟລ໌:** `client/app/composables/api/useApiClient.js`
- **ບັນຫາປັດຈຸບັນ:** ເມື່ອ JWT Token ໝົດອາຍຸ (401), `$fetch` ຈະ Throw error ແຕ່ບໍ່ໄດ້ Clear session ເຮັດໃຫ້ User ຄ້າງໃນ Session ຕາຍ.
- **ວິທີປັບປຸງ:**
  1. ດັກຈັບ `onResponseError` ຫຼື `try/catch` ພາຍໃນ `apiFetch`.
  2. ຖ້າ `error.response?.status === 401`:
     - ເອີ້ນ `auth.logout()`.
     - ເກັບ Current Route ໄວ້ໃນ `redirect` query parameter.
     - ນຳທາງໄປ `/login?redirect=<current_path>` ພ້ອມສະແດງ Toast ເຕືອນ: *"Session ຂອງທ່ານໝົດອາຍຸ, ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່"*.

### 1.2 ເພີ່ມລະບົບຮອງຮັບ Tenant Impersonation Token
- **ໄຟລ໌:** `client/app/middleware/auth.global.js` ແລະ `client/app/stores/auth.js`
- **ບັນຫາປັດຈຸບັນ:** ເມື່ອ Superadmin ຈາກ SaaS Console ກົດ "Login as Tenant" ຜ່ານ URL `?impersonate_token=<token>`, middleware ບໍ່ໄດ້ກວດຈັບ, ສົ່ງຜົນໃຫ້ຖືກ Redirect ໄປ `/login`.
- **ວິທີປັບປຸງ:**
  1. ໃນ `auth.global.js`, ກວດສອບ `to.query.impersonate_token`.
  2. ຖ້າມີ token:
     - ບັນທຶກ token ລົງ `useAuthStore` ຜ່ານ `auth.setSession(...)`.
     - ເອີ້ນ `useAuth().me()` ເພື່ອໂຫຼດຂໍ້ມູນ Tenant Admin User.
     - ລຶບ query param `impersonate_token` ອອກຈາກ URL ຫຼັງ authenticate ສຳເລັດ.
     - ສະແດງແຖບ Banner ສີເຫຼືອງດ້ານເທິງຂອງ Layout: *"ທ່ານກຳລັງຢູ່ໃນໂໝດ Impersonation ໂດຍ Superadmin — [ກັບຄືນ Platform]"*.

### 1.3 ແກ້ໄຂ Tenant Resolution Race Condition
- **ໄຟລ໌:** `client/app/plugins/tenant.client.js` ແລະ `client/app/middleware/tenant.global.js`
- **ບັນຫາປັດຈຸບັນ:** `tenant.resolve()` ເຮັດວຽກໃນ plugin ແບບ async, ເຊິ່ງອາດຊ້າກວ່າ router navigation ເຮັດໃຫ້ middleware ເຫັນເປັນ fallback tenant.
- **ວິທີປັບປຸງ:**
  1. ຮັບປະກັນວ່າ `tenant.resolve()` ມີ Promise Lock ( Singleton resolver ) ເພື່ອປ້ອງກັນການ Fetch ຊໍ້າຊ້ອນ.
  2. ໃນ `tenant.global.js`, ຖ້າ `tenant.loading` ເປັນ true, ໃຫ້ `await tenant.resolve()` ກ່ອນຕັດສິນໃຈ route guard.

---

## ໄລຍະ 2: ແກ້ໄຂ Data Integrity Bugs ໃນ Policy & Claims

### 2.1 ແກ້ໄຂ Payload ຂໍ້ມູນລົດ ແລະ IDs ໃນ PolicyWizard
- **ໄຟລ໌:** `client/app/components/feature/policy/PolicyWizard.vue`
- **ບັນຫາປັດຈຸບັນ:** 
  - `submit()` ສົ່ງແຕ່ `vehiclePlate: form.vehicle.plateNumber`. ຂໍ້ມູນ Make, Model, Year, Engine No, Chassis No, Capacity ຖືກຖິ້ມປະ ເຮັດໃຫ້ Database ເປັນ Unknown.
  - `agentId` ຖືກ Hardcode ເປັນ `1` ສະເໝີ.
  - `customerId` ຖືກ Hardcode ເປັນ `0`.
- **ວິທີປັບປຸງ:**
  1. ປັບປຸງ Payload ຂອງ `submit()` ໃຫ້ສົ່ງ Object `vehicle`:
     ```javascript
     vehicle: {
       plateNumber: form.vehicle.plateNumber,
       make: form.vehicle.make,
       model: form.vehicle.model,
       year: Number(form.vehicle.year) || null,
       engineNumber: form.vehicle.engineNumber || null,
       chassisNumber: form.vehicle.chassisNumber || null,
       engineCapacity: form.vehicle.engineCapacity || null,
       color: form.vehicle.color || null,
       usageType: form.vehicle.usageType || 'private',
     }
     ```
  2. ຜູກ `agentId`:
     ```javascript
     agentId: auth.role === 'agent' ? auth.user?.id : (form.agentId || null)
     ```
  3. ເຊື່ອມຕໍ່ `customerId`: ຖ້າເລືອກລູກຄ້າເກົ່າໃຫ້ສົ່ງ `customerId`, ຖ້າເປັນລູກຄ້າໃໝ່ໃຫ້ສົ່ງ `customerName` ແລະ `customerPhone` ເພື່ອໃຫ້ backend ສ້າງ Customer ໃໝ່ອັດຕະໂນມັດ.

### 2.2 ແກ້ໄຂລະບົບ File Upload ຕົວຈິງ (Claims & Policies)
- **ໄຟລ໌:** 
  - `client/app/components/ui/FileUpload.vue`
  - `client/app/pages/claims/create.vue`
  - `client/app/pages/claims/[id].vue`
  - `server/src/routes/tenantData.ts` (ຫຼື Endpoint ຮັບໄຟລ໌)
- **ບັນຫາປັດຈຸບັນ:** ລະບົບສົ່ງພຽງແຕ່ຊື່ໄຟລ໌ `[form.attachment.name]` ເປັນ String, ບໍ່ໄດ້ Upload ເນື້ອຫາໄຟລ໌ແທ້.
- **ວິທີປັບປຸງ:**
  1. ສ້າງ Composable `useFileUpload()` ທີ່ຮອງຮັບ FormData (`multipart/form-data`) ຫຼື Base64 Data URL.
  2. ເມື່ອ User ເລືອກໄຟລ໌ໃນ `FileUpload.vue`:
     - Upload ໄຟລ໌ໄປຍັງ `/api/tenant/upload` (ຫຼື ເກັບ Base64 Object ພ້ອມ Mime-type).
     - ໄດ້ຮັບ URL ຫຼື Storage Key ກັບມາ.
  3. ໃນ `claims/create.vue`, ສົ່ງ Key/URL ນັ້ນໃນ `attachments`.
  4. ໃນ `claims/[id].vue`, ປຸ່ມດາວໂຫຼດໃຫ້ເປີດ Link ດາວໂຫຼດໄຟລ໌ຕົວຈິງ.

---

## ໄລຍະ 3: ເຊື່ອມຕໍ່ຟອມ ແລະ Workflows ທີ່ຍັງຄ້າງ (Replace Placeholders)

### 3.1 ຟອມແກ້ໄຂລູກຄ້າ (Edit Customer Modal)
- **ໄຟລ໌:** `client/app/pages/customers/index.vue` ແລະ `client/app/pages/customers/[id].vue`
- **ການປັບປຸງ:**
  1. ປ່ຽນປຸ່ມ Edit ທີ່ເຄີຍເປັນ Toast placeholder ໃຫ້ເປີດ `BaseModal` ສໍາລັບແກ້ໄຂ.
  2. ໂຫຼດຂໍ້ມູນລູກຄ້າເຂົ້າ Form: ຊື່, ນາມສະກຸນ, ເບີໂທ, ອີເມວ, ທີ່ຢູ່, ສະຖານະ.
  3. ເອີ້ນ `apiFetch('/customers/:id', { method: 'PATCH', body: form })` ເມື່ອກົດບັນທຶກ.
  4. Refresh ຕາຕະລາງ ແລະ ສະແດງ Success Toast.

### 3.2 ຟອມສ້າງ/ແກ້ໄຂຕົວແທນ (Agent Management Modal)
- **ໄຟລ໌:** `client/app/pages/agents/index.vue`
- **ການປັບປຸງ:**
  1. ເພີ່ມ `BaseModal` "ເພີ່ມຕົວແທນໃໝ່".
  2. ຟອມປະກອບມີ: ຊື່ຜູ້ໃຊ້, ອີເມວ, ເບີໂທ, ເລືອກທີມ (Team), ອັດຕາຄອມມິດຊັ່ນ (`commissionRate`), ລະດັບ (`level`).
  3. ເຊື່ອມຕໍ່ `POST /api/tenant/agents`.

### 3.3 ຟອມສ້າງທີມ (Team Management Modal)
- **ໄຟລ໌:** `client/app/pages/teams/index.vue`
- **ການປັບປຸງ:**
  1. ເພີ່ມ Modal "ສ້າງທີມໃໝ່".
  2. ຟອມປະກອບມີ: ຊື່ທີມ, ຫົວໜ້າທີມ (ເລືອກຈາກ Agent), ພື້ນທີ່/ສາຂາ (`location`).
  3. ເຊື່ອມຕໍ່ `POST /api/tenant/teams`.

### 3.4 ຟອມອອກໃບແຈ້ງໜີ້ ແລະ ຮັບຊຳລະເງິນ (Invoicing & Payments)
- **ໄຟລ໌:** `client/app/pages/finance/invoices/index.vue` ແລະ `client/app/pages/finance/payments/index.vue`
- **ການປັບປຸງ:**
  1. **Invoice Create Modal:** ເລືອກປະກັນໄພ (Policy), ວັນຄົບກຳນົດຊຳລະ (Due Date), ຈຳນວນເງິນ, ໝາຍເຫດ.
  2. **Payment Record Modal:** ເລືອກ Invoice ທີ່ຍັງບໍ່ທັນຈ່າຍ, ວິທີການຊຳລະ (BCEL One, ໂອນທະນາຄານ, ເງິນສົດ), ຈຳນວນເງິນ, ວັນທີຮັບເງິນ, ແລະ ອັບໂຫຼດ Slip.

### 3.5 ບັນທຶກໂປຣໄຟລ໌ແທ້ (Real Profile Save)
- **ໄຟລ໌:** `client/app/pages/profile.vue`
- **ການປັບປຸງ:**
  1. ປັບປຸງຟັງຊັນ `save()` ໃຫ້ເອີ້ນ `PATCH /api/tenant/auth/profile` (ຫຼື `/users/:id`).
  2. ອັບເດດຂໍ້ມູນໃນ `useAuthStore` ໃຫ້ສະແດງຊື່ ແລະ ເບີໂທໃໝ່ທັນທີໂດຍບໍ່ຕ້ອງ Logout.

### 3.6 Workflow ປ່ຽນໃບສະເໜີລາຄາ ເປັນ ປະກັນໄພ (Quotation to Policy)
- **ໄຟລ໌:** `client/app/pages/quotations/[id].vue`
- **ການປັບປຸງ:**
  1. ເພີ່ມປຸ່ມ **"ອອກປະກັນໄພຈາກໃບສະເໜີນີ້ ↗"**.
  2. ເມື່ອກົດ, ໃຫ້ redirect ໄປ `/policies/create` ພ້ອມສົ່ງ Query Param `?quotationId=<id>`.
  3. `PolicyWizard.vue` ດຶງຂໍ້ມູນລູກຄ້າ, ປະເພດລົດ, ແລະ ເບ້ຍປະກັນຈາກ Quotation ມາຕື່ມໃສ່ຟອມອັດຕະໂນມັດ.

---

## ໄລຍະ 4: ມາດຕະຖານ Analytics, URL Query Sync & Modal UX

### 4.1 ແກ້ໄຂ KPI Stats Calculation Bug
- **ໄຟລ໌:**
  - `client/app/composables/api/usePolicies.js`
  - `client/app/composables/api/usePayments.js`
  - `client/app/composables/api/useInvoices.js`
- **ບັນຫາປັດຈຸບັນ:** Stats ຄຳນວນຜ່ານ `list.items.value` ເຊິ່ງມີພຽງ 10 ແຖວໃນໜ້າປັດຈຸບັນ.
- **ວິທີປັບປຸງ:**
  1. ສົ່ງ Request ໄປຍັງ API Endpoint `/stats` ຂອງແຕ່ລະ Entity ເຊິ່ງ Query Aggregate (`COUNT(*)`, `SUM(premium)`) ຈາກທຸກແຖວໃນຖານຂໍ້ມູນ.
  2. ຫ້າມຄຳນວນ Stats ລວມຈາກແຖວທີ່ຜ່ານການ Paginate ແລ້ວ.

### 4.2 Sync ຕົວກອງ (Filters/Search/Pagination) ກັບ URL Query
- **ໄຟລ໌:** `client/app/composables/api/useEntityList.js`
- **ການປັບປຸງ:**
  1. ເມື່ອ `filters`, `page`, ຫຼື `sort` ມີການປ່ຽນແປງ:
     - ໃຊ້ `router.replace({ query: { ...filters, page, sort } })` ເພື່ອບັນທຶກລົງ URL.
  2. ເມື່ອເປີດໜ້າຂຶ້ນມາຄັ້ງທຳອິດ:
     - ອ່ານຄ່າຈາກ `route.query` ມາໃສ່ໃນ `filters` ແລະ `page` ອັດຕະໂນມັດ.
  3. ຜົນໄດ້ຮັບ: ເວລາກົດ Refresh ຫຼື Copy URL ແຊຣ໌ໃຫ້ຄົນອື່ນ, ຜົນການຄົ້ນຫາ ແລະ ໜ້າຈະຍັງຄົງເດີມ.

### 4.3 ມາດຕະຖານ Bootstrap Modal Slide-from-Top ທົ່ວທັງລະບົບ
- **ໄຟລ໌:** ທຸກ Modal ໃນ `client/app/pages/`
- **ການປັບປຸງ:**
  1. ກວດສອບໃຫ້ແນ່ໃຈວ່າ `BaseModal.vue` ໃຊ້ class:
     ```html
     <dialog class="sf-dialog modal modal-top fade ...">
     ```
  2. Animation ເລື່ອນລົງມາຈາກຂອບເທິງ (Slide from top with backdrop blur).
  3. ທຸກໆ Modal ທີ່ສ້າງໃໝ່ (Customer Edit, Agent Create, Team Create, Payment Record) ຕ້ອງໃຊ້ `BaseModal` ມາດຕະຖານນີ້.

---

## ຕາຕະລາງກວດສອບຄວາມສຳເລັດ (Acceptance Checklist)

| ລຳດັບ | ເງື່ອນໄຂການຜ່ານການທົດສອບ (Acceptance Criteria) | ສະຖານະ |
| :---: | :--- | :---: |
| 1 | ເມື່ອ Token ໝົດອາຍຸ (401), ລະບົບ Logout ແລະ ພາໄປ `/login?redirect=...` ອັດຕະໂນມັດ | [x] |
| 2 | Superadmin ກົດ Login as Tenant ຈາກ SaaS Console ສາມາດເຂົ້າສູ່ລະບົບ Tenant ໄດ້ທັນທີ | [x] |
| 3 | ການເຮັດປະກັນໄພຜ່ານ `PolicyWizard` ບັນທຶກຂໍ້ມູນລົດ (Make, Model, Year, Engine No) ຄົບຖ້ວນ | [x] |
| 4 | ການຂາຍປະກັນໄພໂດຍຕົວແທນ ຜູກ `agentId` ຖືກຕ້ອງຕາມ ID ຂອງຜູ້ເຂົ້າໃຊ້ງານແທ້ | [x] |
| 5 | ການແຈ້ງເຄມ ແລະ ເອກະສານບັດປະຊາຊົນ ມີການອັບໂຫຼດໄຟລ໌ຕົວຈິງ ແລະ ສາມາດດາວໂຫຼດໄດ້ | [x] |
| 6 | ຍອດ KPI ໃນໜ້າ Policies, Payments, Invoices ສະແດງຍອດລວມທັງໝົດຂອງ Database ບໍ່ຂຶ້ນກັບ Pagination | [x] |
| 7 | ສາມາດກົດແກ້ໄຂລູກຄ້າ, ເພີ່ມຕົວແທນ, ສ້າງທີມ, ແລະ ຮັບຊຳລະເງິນ ຜ່ານ Modal ໄດ້ແທ້ (ບໍ່ມີ Toast Placeholder) | [x] |
| 8 | ການ Filter, Search, ແລະ ປ່ຽນໜ້າຕາຕະລາງ Sync ກັບ URL Query String | [x] |
| 9 | ທຸກ Modal ເປີດແບບ Bootstrap Slide from Top (`modal modal-top fade`) ແລະ ຂໍ້ຄວາມເປັນພາສາລາວທັງໝົດ | [x] |
| 10 | Run `npm run check:tokens` ແລະ `npm run format:check` ຜ່ານ 100% | [x] |


---

## ບັນທຶກການປັບປຸງທີ່ສຳເລັດ

### ໄຟລ໌ໃໝ່ທີ່ສຳຄັນ
- `app/utils/apiError.js` — 401 detection, one-shot logout/redirect, safe login redirect.
- `app/utils/async.js` — `createSingleFlight()` ສຳລັບ tenant resolver.
- `app/utils/query.js` — parse/build list URL query (filter/page/sort).
- `app/utils/policy.js` — build PolicyWizard payload ຄົບທຸກ field + vehicle object.
- `app/utils/stats.js` — KPI aggregate ຈາກຊຸດຂໍ້ມູນເຕັມ (ບໍ່ຂຶ້ນກັບ pagination).
- `app/utils/uploads.js` + `app/composables/useFileUpload.js` — ອັບໂຫຼດ/ດາວໂຫຼດເອກະສານຕົວຈິງ.
- `app/utils/impersonation.js` + `app/components/shell/ImpersonationBanner.vue`.
- `app/components/feature/customer/CustomerFormModal.vue` — modal ແກ້ໄຂ/ສ້າງລູກຄ້າ.
- `server/src/controllers/uploads.ts` — endpoint ຮັບ Base64 ໄຟລ໌ (ສູງສຸດ 5 MB).
- `server/drizzle/0003_natural_morg.sql` — ເພີ່ມ `invoices.notes` ແລະ `payments.slip_url` ເພື່ອບໍ່ໃຫ້ຂໍ້ມູນຈາກຟອມຫາຍ.
- `customers.id_card_image` ຖືກບັນທຶກຈາກ PolicyWizard ແລະ ສະແດງໃນໜ້າລາຍລະອຽດລູກຄ້າ.

### Endpoint ໃໝ່ທີ່ເຊື່ອມຕໍ່
- `PATCH /api/tenant/auth/profile`
- `POST /api/tenant/agents`
- `POST /api/tenant/uploads`
- ໃຊ້ `GET /api/tenant/{policies|payments|invoices|customers|agents}/stats` ສຳລັບ KPI.

### ການທົດສອບ
```bash
cd client
npm run test:unit      # 89 tests
npm run lint
npm run format:check
npm run check:tokens
```
