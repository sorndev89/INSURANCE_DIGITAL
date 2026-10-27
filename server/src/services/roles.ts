import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import type { Database, Transaction } from '../db/index.js';
import { roles, users } from '../db/schema.js';
import {
  DEFAULT_ROLES,
  LANDING_PATH_VALUES,
  RESERVED_ROLE_KEYS,
  isKnownPermission,
  isSystemPermission,
} from '../config/permissions.js';
import { ApiError } from '../utils/errors.js';
import { asObject, optionalString, requireString } from '../utils/validate.js';
import type { TenantContext, TenantRoleContext } from '../types/context.js';

type Executor = Database | Transaction;

export type RoleRecord = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  isAdmin: boolean;
  landingPath: string;
  userCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

const roleColumns = {
  id: roles.id,
  key: roles.roleKey,
  name: roles.name,
  description: roles.description,
  permissions: roles.permissions,
  isSystem: roles.isSystem,
  isAdmin: roles.isAdmin,
  landingPath: roles.landingPath,
  createdAt: roles.createdAt,
  updatedAt: roles.updatedAt,
};

type RoleRow = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  isAdmin: boolean;
  landingPath: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  userCount?: number;
};

const toRoleRecord = (row: RoleRow): RoleRecord => ({
  ...row,
  permissions: Array.isArray(row.permissions) ? row.permissions : [],
  userCount: Number(row.userCount ?? 0),
});

export const normalizeRoleKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

export const normalizePermissions = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    throw ApiError.badRequest('permissions must be an array');
  }

  const permissions: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') {
      throw ApiError.badRequest('permissions must contain strings');
    }
    const key = item.trim();
    if (!isKnownPermission(key)) {
      throw ApiError.badRequest(`Unknown permission "${key}"`);
    }
    if (isSystemPermission(key)) {
      throw ApiError.badRequest(`Permission "${key}" is reserved for admin`);
    }
    if (!permissions.includes(key)) permissions.push(key);
  }

  return permissions;
};

export const parseLandingPath = (value: unknown, fallback = '/dashboard') => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string') throw ApiError.badRequest('landingPath must be a string');
  if (!LANDING_PATH_VALUES.has(value)) {
    throw ApiError.badRequest('Invalid landingPath');
  }
  return value;
};

const parseDescription = (value: unknown) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return optionalString(value, 'description', { max: 255 });
};

const requireRoleName = (value: unknown) => requireString(value, 'name', { min: 2, max: 100 });

export const findRoleById = async (tenantId: number, id: number) => {
  const [row] = await db
    .select({ ...roleColumns, userCount: sql<number>`count(${users.id})` })
    .from(roles)
    .leftJoin(users, and(eq(users.tenantId, roles.tenantId), eq(users.role, roles.roleKey)))
    .where(and(eq(roles.tenantId, tenantId), eq(roles.id, id)))
    .groupBy(roles.id)
    .limit(1);

  return row ? toRoleRecord(row) : null;
};

export const findRoleByKey = async (tenantId: number, key: string) => {
  const [row] = await db
    .select(roleColumns)
    .from(roles)
    .where(and(eq(roles.tenantId, tenantId), eq(roles.roleKey, key)))
    .limit(1);

  return row ? toRoleRecord(row) : null;
};

export const roleExists = async (tenantId: number, key: string) =>
  Boolean(await findRoleByKey(tenantId, key));

export const listRoles = async (tenantId: number): Promise<RoleRecord[]> => {
  const rows = await db
    .select({ ...roleColumns, userCount: sql<number>`count(${users.id})` })
    .from(roles)
    .leftJoin(users, and(eq(users.tenantId, roles.tenantId), eq(users.role, roles.roleKey)))
    .where(eq(roles.tenantId, tenantId))
    .groupBy(roles.id)
    .orderBy(desc(roles.isAdmin), desc(roles.isSystem), asc(roles.name));

  return rows.map(toRoleRecord);
};

export const listRoleOptions = async (tenantId: number) => {
  const rows = await db
    .select({
      id: roles.id,
      key: roles.roleKey,
      name: roles.name,
      isSystem: roles.isSystem,
      isAdmin: roles.isAdmin,
    })
    .from(roles)
    .where(eq(roles.tenantId, tenantId))
    .orderBy(desc(roles.isAdmin), desc(roles.isSystem), asc(roles.name));

  return rows;
};

const uniqueRoleKey = async (tenantId: number, requested: string, autoSuffix: boolean) => {
  const base = normalizeRoleKey(requested);
  if (!base) throw ApiError.badRequest('role key is required');
  if (base.length < 2) throw ApiError.badRequest('role key is too short');

  if (RESERVED_ROLE_KEYS.has(base) || (await roleExists(tenantId, base))) {
    if (!autoSuffix) throw ApiError.conflict('Role key is already in use');
    const prefix = base.slice(0, 47);
    let suffix = 2;
    while (await roleExists(tenantId, `${prefix}-${suffix}`)) suffix += 1;
    return `${prefix}-${suffix}`;
  }

  return base;
};

export const createRole = async (
  tenantId: number,
  value: unknown,
): Promise<RoleRecord> => {
  const body = asObject(value);
  const name = requireRoleName(body.name);
  const description = parseDescription(body.description) ?? null;
  const permissions = normalizePermissions(body.permissions ?? []);
  const landingPath = parseLandingPath(body.landingPath);
  const explicitKey = typeof body.key === 'string' && body.key.trim() ? body.key : null;
  const requestedKey = explicitKey || normalizeRoleKey(name) || 'role';
  const key = await uniqueRoleKey(tenantId, requestedKey, !explicitKey);

  const [result] = await db.insert(roles).values({
    tenantId,
    roleKey: key,
    name,
    description,
    permissions,
    isSystem: false,
    isAdmin: false,
    landingPath,
  });

  const created = await findRoleById(tenantId, result.insertId);
  if (!created) throw ApiError.badRequest('Could not create role');
  return created;
};

export const updateRole = async (
  tenantId: number,
  id: number,
  value: unknown,
): Promise<RoleRecord> => {
  const existing = await findRoleById(tenantId, id);
  if (!existing) throw ApiError.notFound('Role not found');
  if (existing.isAdmin) throw ApiError.forbidden('Admin role cannot be modified');

  const body = asObject(value);
  const patch: {
    name?: string;
    description?: string | null;
    permissions?: string[];
    landingPath?: string;
  } = {};

  if (existing.isSystem) {
    if (body.permissions !== undefined) {
      patch.permissions = normalizePermissions(body.permissions);
    }
    if (!Object.keys(patch).length) {
      throw ApiError.badRequest('System roles only allow permission updates');
    }
  } else {
    if (body.key !== undefined && body.key !== null && body.key !== '') {
      const nextKey = normalizeRoleKey(String(body.key));
      if (nextKey && nextKey !== existing.key) {
        throw ApiError.badRequest('Role key cannot be changed');
      }
    }
    if (body.name !== undefined) patch.name = requireRoleName(body.name);
    if (body.description !== undefined) patch.description = parseDescription(body.description) ?? null;
    if (body.permissions !== undefined) patch.permissions = normalizePermissions(body.permissions);
    if (body.landingPath !== undefined) patch.landingPath = parseLandingPath(body.landingPath);
    if (!Object.keys(patch).length) throw ApiError.badRequest('No supported fields to update');
  }

  await db
    .update(roles)
    .set(patch)
    .where(and(eq(roles.tenantId, tenantId), eq(roles.id, id)));

  const updated = await findRoleById(tenantId, id);
  if (!updated) throw ApiError.notFound('Role not found');
  return updated;
};

export const deleteRole = async (tenantId: number, id: number) => {
  const existing = await findRoleById(tenantId, id);
  if (!existing) throw ApiError.notFound('Role not found');
  if (existing.isSystem) throw ApiError.badRequest('System roles cannot be deleted');
  if (existing.userCount > 0) {
    throw ApiError.conflict(
      `Role is assigned to ${existing.userCount} user${existing.userCount === 1 ? '' : 's'}`,
    );
  }

  await db.delete(roles).where(and(eq(roles.tenantId, tenantId), eq(roles.id, id)));
};

export const ensureSystemRoles = async (
  tenantId: number,
  executor: Executor = db,
  overrides?: Record<string, string[]> | null,
) => {
  const rows = await executor
    .select({ key: roles.roleKey })
    .from(roles)
    .where(eq(roles.tenantId, tenantId));
  const existing = new Set(rows.map((row) => row.key));

  for (const role of DEFAULT_ROLES) {
    if (existing.has(role.key)) continue;

    let permissions = role.permissions;
    if (!role.isAdmin && overrides?.[role.key]) {
      permissions = overrides[role.key].filter(
        (permission) => isKnownPermission(permission) && !isSystemPermission(permission),
      );
    }

    await executor.insert(roles).values({
      tenantId,
      roleKey: role.key,
      name: role.name,
      description: role.description,
      permissions: role.isAdmin ? ['*'] : permissions,
      isSystem: true,
      isAdmin: role.isAdmin,
      landingPath: role.landingPath,
    });
  }
};

export const resolveAccess = (
  tenant: TenantContext,
  roleKey: string,
): TenantRoleContext & { permissions: string[] } | null => {
  const role = tenant.roles.find((item) => item.key === roleKey);
  if (!role) return null;
  return {
    ...role,
    permissions: role.isAdmin ? ['*'] : role.permissions,
  };
};
