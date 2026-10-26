import assert from 'node:assert/strict';
import test from 'node:test';
import { extractHost, resolveTenantHost } from './requestHost.js';

test('extracts the first host, lowercases and strips the port', () => {
  assert.equal(extractHost('App.Example.com:8443, proxy.local'), 'app.example.com');
  assert.equal(extractHost(undefined), '');
});

test('resolves the tenant host from a cross-origin browser Origin', () => {
  assert.equal(
    resolveTenantHost({
      host: 'admin.example.com',
      origin: 'https://appins.stindev.com',
    }),
    'appins.stindev.com',
  );
});

test('prefers explicit X-Tenant-Host and query host over Origin', () => {
  assert.equal(
    resolveTenantHost({
      host: 'admin.example.com',
      origin: 'https://ignored.example.com',
      xTenantHost: 'tenant.Example.com:443, proxy.local',
    }),
    'tenant.example.com',
  );
  assert.equal(
    resolveTenantHost({
      host: 'admin.example.com',
      origin: 'https://ignored.example.com',
      xTenantHost: 'header.example.com',
      queryHost: 'query.example.com',
    }),
    'header.example.com',
  );
  assert.equal(
    resolveTenantHost({
      host: 'admin.example.com',
      origin: 'https://ignored.example.com',
      queryHost: 'query.example.com',
    }),
    'query.example.com',
  );
});

test('falls back to the API Host for same-origin and native requests', () => {
  assert.equal(
    resolveTenantHost({ host: 'admin.example.com:5055', origin: 'capacitor://localhost' }),
    'admin.example.com',
  );
  assert.equal(resolveTenantHost({ host: 'admin.example.com', origin: 'not-a-url' }), 'admin.example.com');
  assert.equal(resolveTenantHost({ host: 'admin.example.com', origin: 'null' }), 'admin.example.com');
});

test('returns an empty host when nothing is available', () => {
  assert.equal(resolveTenantHost({}), '');
});
