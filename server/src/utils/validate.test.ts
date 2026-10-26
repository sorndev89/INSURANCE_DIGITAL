import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError } from './errors.js';
import {
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
