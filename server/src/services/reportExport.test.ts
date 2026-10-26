import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCsv, buildPdf, buildXlsx } from './reportExport.js';

const data = {
  range: { from: '2026-01-01', to: '2026-10-31' },
  totals: { totalPremium: 1500, policyCount: 2 },
  byProduct: [
    { key: 'Motor', label: 'ປະກັນໄພລົດຍົນ', value: 1000, count: 1 },
    { key: 'Health', label: 'ປະກັນສຸຂະພາບ', value: 500, count: 1 },
  ],
};

const meta = { type: 'sales', title: 'ລາຍງານຍອດຂາຍ', from: '2026-01-01', to: '2026-10-31' };

test('buildCsv renders Lao headers and every row', () => {
  const csv = buildCsv(data);
  assert.match(csv, /ເບ້ຍປະກັນລວມ/);
  assert.match(csv, /ປະກັນໄພລົດຍົນ/);
  assert.match(csv, /ປະກັນສຸຂະພາບ/);
});

test('buildXlsx returns a valid xlsx (zip) payload', async () => {
  const buffer = await buildXlsx(data, meta);
  assert.equal(buffer.subarray(0, 2).toString(), 'PK');
  assert.ok(buffer.length > 1000);
});

test('buildPdf returns a valid pdf payload', async () => {
  const buffer = await buildPdf(data, meta);
  assert.equal(buffer.subarray(0, 4).toString(), '%PDF');
  assert.ok(buffer.length > 1000);
});
