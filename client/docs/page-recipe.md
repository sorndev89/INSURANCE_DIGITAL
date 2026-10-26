# Page Recipe — Checklist ສຳລັບໜ້າໃໝ່

> ທຸກໜ້າຕ້ອງຜ່ານ checklist ນີ້ກ່ອນຖືວ່າ "ສຳເລັດ".

## 1. Route & Meta

```js
definePageMeta({
  layout: 'admin',
  title: 'ຈັດການປະກັນໄພ',
  permission: 'policy.view',
})
```

- [ ] ບໍ່ມີ `<NuxtLayout>` wrapper ໃນ page
- [ ] ບໍ່ມີ `layout: false`
- [ ] `title` ຢູ່ໃນ `route.meta` ແລະ ສະແດງໃນ Header/Breadcrumb

## 2. Data

```js
const { items, total, page, pageSize, pending, error, refresh, filters } = usePolicies()
```

- [ ] ຂໍ້ມູນຜ່ານ `useXxx()` ເທົ່ານັ້ນ
- [ ] ບໍ່ມີ array/object mock ໃນ page
- [ ] ມີ `pending`, `error`, `refresh`
- [ ] ມີ empty state ເມື່ອ `items.length === 0`
- [ ] filter/search ມີ debounce

## 3. UI

- [ ] ໃຊ້ `PageHeader`, `StatCard`, `DataTable`, `StatusBadge`
- [ ] ບໍ່ຂຽນ `<table>` ເອງ
- [ ] ບໍ່ມີສີດິບ / `font-black` / `text-[10-11px]`
- [ ] ເງິນ/ວັນທີ/ເບີໂທ ຜ່ານ `useFormat()`
- [ ] loading = skeleton, ບໍ່ໃຊ້ "Data Loading"

## 4. Responsive

- [ ] 375px: 1 ຖັນ, ບໍ່ມີ horizontal scroll
- [ ] 768px: rail/2 ຖັນ
- [ ] 1280px: sidebar/ຕາຕະລາງເຕັມ
- [ ] light + dark
- [ ] touch target ≥ 44×44px
- [ ] safe-area ສຳລັບ mobile

## 5. A11y

- [ ] icon button ມີ `aria-label`
- [ ] focus ring ເຫັນຊັດ
- [ ] ຟອມ: label + `aria-invalid` + `aria-describedby`
- [ ] ຕາຕະລາງ: `<th scope>`, caption
- [ ] ໃຊ້ແປ້ນພິມໄດ້
- [ ] axe 0 serious/critical

## 6. Tests

- [ ] unit test ສຳລັບ logic ທີ່ບໍ່ແມ່ນ UI
- [ ] E2E flow ຫຼັກ (ຖ້າມີ)
- [ ] `npm run lint`, `npm run check:tokens`, `npm run test:unit` ຜ່ານ

## 7. Definition of Done

- [ ] ຜ່ານ checklist ທັງໝົດ
- [ ] 3 viewport × light/dark
- [ ] ບໍ່ມີ lint error
- [ ] ບໍ່ມີ asset ພາຍນອກ
- [ ] ຂໍ້ຄວາມຜ່ານ glossary
