# API Route Map

| Prefix | Realm | Auth | ໝາຍເຫດ |
|---|---|---|---|
| `/health`, `/api/health` | infra | — | DB ping |
| `/api/internal/*` | internal | `TLS_ASK_TOKEN` | Caddy on-demand TLS |
| `/api/public/*` | public | — | tenant resolve, plans |
| `/api/platform/*` | control plane | platform JWT (`aud=platform`) | tenants, domains, plans, audit |
| `/api/tenant/*` | tenant | tenant JWT (`aud=tenant`) + Host/`X-Tenant` | auth, users, business data |

## Tenant endpoints

```text
/api/tenant/auth/register|login|me
/api/tenant/users
/api/tenant/users/stats
/api/tenant/dashboard
/api/tenant/reports/{summary,sales,policies,quotations,claims,customers,agents,teams,commissions,finance}?from=YYYY-MM-DD&to=YYYY-MM-DD
/api/tenant/reports/export?type=<report>&from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv|xlsx|pdf
/api/tenant/customers[/stats|/:id]
/api/tenant/agents[/stats|/:id]
/api/tenant/teams
/api/tenant/companies
/api/tenant/products
/api/tenant/policies[/stats|/:id|/:id/status]
/api/tenant/quotations[/stats|/:id|/:id/status]
/api/tenant/claims[/stats|/:id|/:id/status]
/api/tenant/commissions[/stats|/:id/pay]
/api/tenant/invoices[/stats]
/api/tenant/payments[/stats]
```

## Route ລຳດັບສຳຄັນ

- Static routes (`/stats`) ຕ້ອງຢູ່ກ່ອນ `/:id` ສະເໝີ
- ບໍ່ມີ generic tenant mount ຢູ່ `/api`; unknown `/api/*` → `404 route_not_found`
- Tenant router ໃຊ້ middleware ຕໍ່ route (ບໍ່ໃຊ້ `router.use(auth)` ກັບ unknown paths)

## Legacy aliases (ຊົ່ວຄາວ)

`/api/auth/*`, `/api/users/*`, `/api/<resource>` ຍັງໃຊ້ໄດ້ ສຳລັບ mobile build ເກົ່າ:

- `Deprecation: true`
- `Sunset: <API_LEGACY_SUNSET>` (default 2027-01-31)
- `Link: </api/tenant/...>; rel="successor-version"`

ລຶບ legacy ຫຼັງຈາກ log ບໍ່ມີການໃຊ້ແລ້ວ.
