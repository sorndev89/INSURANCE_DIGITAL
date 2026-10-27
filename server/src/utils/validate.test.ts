import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError } from './errors.js';
import {
  optionalAvatar,
  parseCurrencyDisplay,
  requireEmail,
  requireHostname,
  requirePassword,
  requireSlug,
  requireString,
} from './validate.js';

test('requireSlug accepts safe slugs', () => {
  assert.equal(requireSlug('acme'), 'acme');
  assert.equal(requireSlug('acme-insurance-2'), 'acme-insurance-2');
});

test('requireSlug rejects unsafe slugs', () => {
  assert.throws(() => requireSlug('-acme'));
  assert.throws(() => requireSlug('acme_insurance'));
  assert.equal(requireSlug('Acme'), 'acme');
});

test('requireEmail normalizes and validates', () => {
  assert.equal(requireEmail(' ADMIN@Example.COM '), 'admin@example.com');
  assert.throws(() => requireEmail('not-an-email'));
});

test('requirePassword enforces minimum length', () => {
  assert.equal(requirePassword('Secret123!'), 'Secret123!');
  assert.throws(() => requirePassword('short'));
});

test('requireHostname accepts domains and rejects URLs', () => {
  assert.equal(requireHostname('Insurance.Acme.com'), 'insurance.acme.com');
  assert.throws(() => requireHostname('https://acme.com'));
  assert.throws(() => requireHostname('localhost'));
});

test('requireString reports ApiError with a code', () => {
  try {
    requireString('', 'name');
    assert.fail('expected error');
  } catch (error) {
    assert.ok(error instanceof ApiError);
    assert.equal(error.code, 'bad_request');
  }
});

test('parseCurrencyDisplay accepts supported values and clears with null', () => {
  assert.deepEqual(parseCurrencyDisplay({ symbol: 'kip', position: 'prefix' }), {
    symbol: 'kip',
    position: 'prefix',
  });
  assert.deepEqual(parseCurrencyDisplay({ symbol: 'lak', position: 'suffix' }), {
    symbol: 'lak',
    position: 'suffix',
  });
  assert.equal(parseCurrencyDisplay(null), null);
  assert.equal(parseCurrencyDisplay(undefined), undefined);
});

test('parseCurrencyDisplay rejects unsupported values', () => {
  assert.throws(() => parseCurrencyDisplay({ symbol: 'usd', position: 'prefix' }));
  assert.throws(() => parseCurrencyDisplay({ symbol: 'kip', position: 'middle' }));
  assert.throws(() => parseCurrencyDisplay('kip'));
});

test('optionalAvatar accepts data urls and upload urls', () => {
  assert.equal(optionalAvatar(null), null);
  assert.equal(optionalAvatar(''), null);
  const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
  assert.equal(optionalAvatar(dataUrl), dataUrl);
  assert.equal(optionalAvatar('/uploads/1/avatar.png'), '/uploads/1/avatar.png');
  assert.equal(optionalAvatar('https://cdn.example.com/a.png'), 'https://cdn.example.com/a.png');
});

test('optionalAvatar rejects unsafe or non-image values', () => {
  assert.throws(() => optionalAvatar('javascript:alert(1)'));
  assert.throws(() => optionalAvatar('data:text/html;base64,PHNjcmlwdD4='));
  assert.throws(() => optionalAvatar('x'.repeat(65001)));
});
