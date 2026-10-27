import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ALL_PERMISSION_KEYS,
  DEFAULT_ROLES,
  PERMISSION_GROUPS,
  SYSTEM_PERMISSION_KEYS,
  isKnownPermission,
  isSystemPermission,
} from './permissions.js';

test('permission catalog has unique keys', () => {
  const keys = [...ALL_PERMISSION_KEYS];
  assert.equal(keys.length, new Set(keys).size);
});

test('every group has at least one permission', () => {
  for (const group of PERMISSION_GROUPS) {
    assert.ok(group.permissions.length > 0, `${group.key} is empty`);
  }
});

test('system permissions are not part of editable groups', () => {
  const editableKeys = new Set(
    PERMISSION_GROUPS.flatMap((group) => group.permissions.map((permission) => permission.key)),
  );
  for (const key of SYSTEM_PERMISSION_KEYS) {
    assert.equal(editableKeys.has(key), false);
  }
});

test('default roles only reference known permissions', () => {
  for (const role of DEFAULT_ROLES) {
    for (const permission of role.permissions) {
      if (permission === '*') continue;
      assert.ok(isKnownPermission(permission), `${role.key}: ${permission}`);
    }
  }
});

test('admin is the only admin role', () => {
  assert.deepEqual(
    DEFAULT_ROLES.filter((role) => role.isAdmin).map((role) => role.key),
    ['admin'],
  );
});

test('system-only permission detection', () => {
  assert.equal(isSystemPermission('user.manage'), true);
  assert.equal(isSystemPermission('policy.view'), false);
});
