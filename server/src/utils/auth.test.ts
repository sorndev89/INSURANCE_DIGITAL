import assert from 'node:assert/strict';
import test from 'node:test';
import {
  generatePlatformToken,
  generateTenantToken,
  verifyPlatformToken,
  verifyTenantToken,
} from './auth.js';

const tenantUser = { id: 7, tenantId: 1, email: 'admin@acme.test', role: 'admin' };
const platformUser = { id: 2, email: 'ops@saiyfon.com', role: 'superadmin' as const };

test('tenant token round-trip keeps tenant claim', () => {
  const token = generateTenantToken(tenantUser);
  const claims = verifyTenantToken(token);
  assert.equal(claims.uid, tenantUser.id);
  assert.equal(claims.tid, tenantUser.tenantId);
  assert.equal(claims.role, 'admin');
  assert.equal(claims.typ, 'tenant');
});

test('platform token round-trip keeps platform role', () => {
  const token = generatePlatformToken(platformUser);
  const claims = verifyPlatformToken(token);
  assert.equal(claims.pid, platformUser.id);
  assert.equal(claims.role, 'superadmin');
  assert.equal(claims.typ, 'platform');
});

test('tenant token cannot be used in the platform realm', () => {
  const token = generateTenantToken(tenantUser);
  assert.throws(() => verifyPlatformToken(token));
});

test('platform token cannot be used in the tenant realm', () => {
  const token = generatePlatformToken(platformUser);
  assert.throws(() => verifyTenantToken(token));
});

test('tenant token requires a tenant', () => {
  assert.throws(() => generateTenantToken({ ...tenantUser, tenantId: null }));
});
