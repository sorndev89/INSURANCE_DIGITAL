# API & Mock Contract

> Backend ຈິງ: **Express 5 + Drizzle ORM + MySQL + JWT** (`server/`).
> Frontend ຮອບນີ້ໃຊ້ mock ຜ່ານ composable ດຽວ; ການປ່ຽນ mock ↔ API ເຮັດທີ່ `runtimeConfig.public.useMock`.

## 1. ຫຼັກການ

- ທຸກ list ສົ່ງຄືນ `{ data, meta }`.
- ທຸກ single/mutation ສົ່ງຄືນ `{ data }`.
- Error: `{ error: { code, message, details? } }`.
- ວັນທີ transport: `YYYY-MM-DD`; ສະແດງ: `dd/mm/yyyy`.
- ເງິນ transport: ຈຳນວນເຕັມ LAK (integer); ສະແດງ: `₭ 1,000,000`.
- Auth header: `Authorization: Bearer <token>`.

## 2. Tenant Auth (server ມີແລ້ວ)

Tenant API ຕ້ອງລະບຸ tenant ຜ່ານ `Host` (web) ຫຼື header `X-Tenant: <slug>` (mobile/dev).

```http
POST /api/tenant/auth/register
{ "username": "...", "email": "...", "password": "..." }

POST /api/tenant/auth/login
{ "email": "...", "password": "..." }
→ 200 {
    "data": {
      "token": "...",
      "user": { "id": 1, "username": "...", "email": "...", "role": "admin" },
      "tenant": { "id": 1, "slug": "saiyfon", "name": "...", "status": "active", "branding": {}, "features": [] }
    }
  }
→ 401 { "error": { "code": "invalid_credentials", "message": "Invalid email or password" } }

GET /api/tenant/auth/me
Authorization: Bearer <token>
→ 200 { "data": { "id": 1, "username": "...", "email": "...", "role": "admin", ... } }
```

## 2.1 Public tenant bootstrap

```http
GET /api/public/tenant                # resolve ຈາກ Host
GET /api/public/tenant?slug=saiyfon   # dev/mobile
→ 200 {
    "data": {
      "slug": "saiyfon", "name": "ສາຍຝົນ ປະກັນໄພ", "status": "active|trial|suspended",
      "hostname": "saiyfon.saiyfon.app",
      "branding": { "name": "...", "logoUrl": "...", "primaryColor": "#10b981" },
      "locale": "lo", "currency": "LAK", "timezone": "Asia/Vientiane",
      "features": ["policies", "..."]
    }
  }
→ 404 { "error": { "code": "tenant_not_found", "message": "..." } }

GET /api/public/plans
→ 200 { "data": [ { "code": "pro", "name": "...", "limits": {}, "features": [] } ] }
```

> ຝັ່ງ client: `stores/tenant.js` ໃຊ້ endpoint ນີ້ ແລະ ປ່ຽນ CSS vars/title ຕາມ branding.
> `useMock` ເປັນພຽງຂໍ້ມູນທຸລະກິດ; tenant bootstrap ຍັງຍິງ API ຈິງ (ຫຼື `NUXT_PUBLIC_TENANT_MODE=mock`).

## 2.2 Platform (SaaS console) — ມີໃນ server

> Legacy tenant paths `/api/auth/*`, `/api/users/*`, `/api/<resource>` ຍັງໃຊ້ໄດ້ຊົ່ວຄາວ (Deprecation/Sunset headers) ສຳລັບ mobile app ເກົ່າ.

```http
POST /api/platform/auth/login   → { "data": { "token", "user" } }   # aud=platform
GET  /api/platform/auth/me
GET  /api/platform/tenants?page&pageSize&search
POST /api/platform/tenants
GET/PATCH/DELETE /api/platform/tenants/:id
POST /api/platform/tenants/:id/suspend|activate
POST /api/platform/tenants/:id/domains
POST /api/platform/tenants/:id/domains/:domainId/verify
POST /api/platform/tenants/:id/impersonate
GET  /api/platform/tenants/:id/usage
GET/POST/PATCH /api/platform/plans
GET  /api/platform/audit-logs
```

ລາຍລະອຽດເຕັມຢູ່ `server/README.md`; console ຢູ່ `admin/`.

## 3. List contract

```js
// composable
{
  items, total, page, pageSize,
  pending, error, refresh, filters
}
```

Query ມາດຕະຖານ:

```text
?page=1&pageSize=10&search=&sort=createdAt&order=desc
```

Response:

```json
{
  "data": [],
  "meta": { "total": 0, "page": 1, "pageSize": 10 }
}
```

## 4. Entities

### User

```js
{ id, username, email, role, phone, status, avatar, createdAt }
```

### Customer

```js
{ id, userId, firstName, lastName, dob, gender, address, idCardNumber, passportNumber, occupation, phone }
```

### Agent

```js
{ id, userId, agentCode, creditLimit, salesTarget, commissionRate, taxRate, teamId }
```

### Company / Product

```js
Company: { id, code, name, address, contactPerson, contactPhone, logo }
Product: { id, companyId, name, type: 'Motor'|'Health'|'Fire'|'Accident', description }
```

### Vehicle

```js
{ id, customerId, make, model, year, plateNumber, engineNumber, chassisNumber, engineCapacity, color, usageType }
```

### Policy

```js
{
  id, policyNumber, customerId, agentId, vehicleId, companyId,
  productType, startDate, endDate,
  netPremium, vatAmount, registrationFee, totalPremium,
  status: 'pending'|'active'|'expired'|'cancelled'
}
```

### Quotation / Claim

```js
Quotation: { id, customerId, productId, premium, validUntil, status: 'draft'|'sent'|'accepted'|'expired' }
Claim: { id, policyId, type, incidentDate, amount, status: 'pending'|'reviewing'|'approved'|'rejected', attachments }
```

### Commission / Invoice / Payment

```js
Commission: { id, agentId, policyId, rate, amount, status: 'pending'|'paid', paidAt }
Invoice: { id, policyId, amount, dueDate, status: 'unpaid'|'paid'|'overdue' }
Payment: { id, invoiceId, amount, method, paidAt }
```

## 5. Tenant data API (server ມີແລ້ວ)

ທຸກ endpoint ຕ້ອງມີ `Authorization` ແລະ tenant (`Host` ຫຼື `X-Tenant`).

```http
GET  /api/tenant/dashboard
GET  /api/tenant/reports/summary|sales|policies|quotations|claims|customers|agents|teams|commissions|finance?from&to
GET  /api/tenant/reports/export?type&from&to&format=csv|xlsx|pdf
GET  /api/tenant/users/stats
GET  /api/tenant/customers              POST /api/tenant/customers              PATCH /api/tenant/customers/:id
GET  /api/tenant/customers/:id
GET  /api/tenant/agents                 GET  /api/tenant/agents/:id             GET /api/tenant/agents/stats
GET  /api/tenant/customers/stats
GET  /api/tenant/teams                  POST /api/tenant/teams
GET  /api/tenant/companies              GET  /api/tenant/products
GET  /api/tenant/policies               POST /api/tenant/policies               PATCH /api/tenant/policies/:id/status
GET  /api/tenant/policies/stats
GET  /api/tenant/policies/:id
GET  /api/tenant/quotations             POST /api/tenant/quotations             PATCH /api/tenant/quotations/:id/status
GET  /api/tenant/quotations/stats
GET  /api/tenant/quotations/:id
GET  /api/tenant/claims                 POST /api/tenant/claims                 PATCH /api/tenant/claims/:id/status
GET  /api/tenant/claims/stats
GET  /api/tenant/claims/:id
GET  /api/tenant/commissions            POST /api/tenant/commissions/:id/pay   GET /api/tenant/commissions/stats
GET  /api/tenant/invoices               POST /api/tenant/invoices              GET /api/tenant/invoices/stats
GET  /api/tenant/payments               POST /api/tenant/payments              GET /api/tenant/payments/stats
```

- Lists: `?page&pageSize&search&sort=field:asc|desc` + filters (`status`, `type`, `productType`, `teamId`).
- Response: `{ data, meta: { total, page, pageSize } }`; single/mutation `{ data }`.
- ສ້າງ policy/claim/quotation ຮັບໄດ້ທັງ ID ແລະຊື່ (`customerName`, `companyCode`, `productName`, `policyNumber`) ເພື່ອໃຫ້ wizard ເຮັດວຽກໄດ້.
- ຂໍ້ມູນເງິນສົ່ງເປັນ number; ວັນທີ `YYYY-MM-DD`.
- `plan_limit_reached` (403) ເມື່ອເກີນ `maxUsers` / `maxPolicies`.

> Notifications, billing, file upload ຍັງບໍ່ມີ. Server ບໍ່ໄດ້ scope ແບບ `own` ສຳລັບ agent ເທື່ອ (tenant isolation ຢ່າງດຽວ).

## 6. Roles & Permissions

```text
admin:
  dashboard.view, policy.*, quotation.*, customer.*, agent.*, team.*,
  commission.*, claim.*, finance.*, report.*, user.*, settings.manage, profile.view

staff:
  dashboard.view, policy.view/create/update, quotation.*, customer.*,
  agent.view, team.view, commission.view, claim.*, finance.*, report.view, profile.view

agent:
  dashboard.view, policy.view/create (own), quotation.* (own), customer.view/create/update (own),
  commission.view (own), claim.view/create (own), profile.view

customer:
  policy.view (own), quotation.view/create (own), claim.view/create (own),
  payment.create (own), profile.view
```

> `own` ໝາຍເຖິງ scope ຂໍ້ມູນ; backend ຕ້ອງເປັນຜູ້ບັງຄັບໃຊ້. Route guard ເປັນພຽງ UX.

## 7. Mock behavior

- delay 300–800ms (`NUXT_PUBLIC_MOCK_DELAY`).
- pagination/filter/sort ໃນ `mocks/_helpers.js`.
- failure ສຸ່ມເປີດດ້ວຍ `NUXT_PUBLIC_MOCK_FAILURE_RATE` (default 0).
- deterministic fixtures; ຫ້າມ `Math.random()` ໃນ render.
- ບໍ່ມີ plaintext password ຂອງຜູ້ໃຊ້ຈິງ; demo accounts ຢູ່ README ເທົ່ານັ້ນ.
