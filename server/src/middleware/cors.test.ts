import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateOrigin, normalizeOrigin, type OriginCheckInput } from './cors.js';

const base: OriginCheckInput = {
  origin: '',
  isProduction: true,
  adminHost: 'admin.example.com',
  rootDomain: 'app.example.com',
  extraOrigins: [],
  allowRootSubdomains: false,
  verifiedHostnames: new Set(['saiyfon.app.example.com', 'insurance.customer.com']),
};

const allowed = (origin: string, overrides: Partial<OriginCheckInput> = {}) =>
  evaluateOrigin({ ...base, origin, ...overrides });

test('normalizes origins and strips paths', () => {
  assert.equal(normalizeOrigin('HTTPS://App.Example.com/path?q=1'), 'https://app.example.com');
  assert.equal(normalizeOrigin('http://localhost:3000/'), 'http://localhost:3000');
  assert.equal(normalizeOrigin('not-a-url'), '');
  assert.equal(normalizeOrigin('capacitor://localhost'), '');
});

test('allows exact admin host and root domain', () => {
  assert.equal(allowed('https://admin.example.com'), true);
  assert.equal(allowed('https://app.example.com'), true);
});

test('allows verified tenant primary and custom domains', () => {
  assert.equal(allowed('https://saiyfon.app.example.com'), true);
  assert.equal(allowed('https://insurance.customer.com'), true);
});

test('denies unverified custom domains', () => {
  assert.equal(allowed('https://unverified.customer.com'), false);
});

test('denies arbitrary root subdomains unless explicitly enabled', () => {
  assert.equal(allowed('https://evil.app.example.com'), false);
  assert.equal(
    allowed('https://evil.app.example.com', { allowRootSubdomains: true }),
    true,
  );
});

test('allows extra origins only when normalized exactly', () => {
  assert.equal(
    allowed('https://staging.example.com', {
      extraOrigins: ['https://staging.example.com/'],
    }),
    true,
  );
  assert.equal(
    allowed('https://staging.example.com.evil.com', {
      extraOrigins: ['https://staging.example.com'],
    }),
    false,
  );
});

test('allows native app origins', () => {
  assert.equal(allowed('capacitor://localhost'), true);
  assert.equal(allowed('ionic://localhost'), true);
});

test('allows localhost dev origins but not in production unless static', () => {
  assert.equal(allowed('http://localhost:4321', { isProduction: false }), true);
  assert.equal(allowed('http://localhost:4321', { isProduction: true }), false);
  assert.equal(allowed('http://localhost:3000', { isProduction: true }), true);
});

test('denies malformed, empty and unknown origins', () => {
  assert.equal(allowed(''), false);
  assert.equal(allowed('not-a-url'), false);
  assert.equal(allowed('https://other.example.com'), false);
});

test('matches verified hosts by hostname, including ports', () => {
  assert.equal(allowed('https://saiyfon.app.example.com:8443'), true);
  assert.equal(allowed('http://saiyfon.app.example.com'), true);
});
