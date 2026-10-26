import type { Request, Response } from 'express';
import { hashPassword } from '../utils/auth.js';
import { ApiError } from '../utils/errors.js';
import {
  asObject,
  optionalString,
  parsePagination,
  requireEmail,
  requirePassword,
  requireString,
} from '../utils/validate.js';
import { createUser, findUserByEmail, findUserById, listUsers, removeUser, updateUser, userStats } from '../repositories/users.js';

const ROLES = new Set(['admin', 'staff', 'agent', 'customer']);
const STATUSES = new Set(['active', 'inactive', 'suspended']);

const requireTenant = (req: Request) => {
  if (!req.tenant) throw ApiError.badRequest('Tenant context is required');
  return req.tenant;
};

const usernameFromEmail = (email: string) =>
  email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 50) || 'user';

export const list = async (req: Request, res: Response) => {
  const tenant = requireTenant(req);
  const { page, pageSize } = parsePagination(req.query as Record<string, unknown>);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const role = typeof req.query.role === 'string' ? req.query.role : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const result = await listUsers(tenant.id, { search, page, pageSize, role, status });
  res.json({ data: result.items, meta: { total: result.total, page, pageSize } });
};

export const stats = async (req: Request, res: Response) => {
  const tenant = requireTenant(req);
  res.json({ data: await userStats(tenant.id) });
};

export const create = async (req: Request, res: Response) => {
  const tenant = requireTenant(req);
  const body = asObject(req.body);
  const email = requireEmail(body.email);
  const password = requirePassword(body.password);
  const username = optionalString(body.username, 'username', { min: 2, max: 255 });
  const phone = optionalString(body.phone, 'phone', { max: 20 });
  const role = optionalString(body.role, 'role', { max: 50 }) || 'staff';

  if (!ROLES.has(role)) throw ApiError.badRequest('Invalid role');

  const existing = await findUserByEmail(tenant.id, email);
  if (existing) throw ApiError.conflict('Email is already registered for this tenant');

  const id = await createUser(tenant.id, {
    username: username || usernameFromEmail(email),
    email,
    password: await hashPassword(password),
    role,
    phone,
  });

  const user = await findUserById(tenant.id, id);
  res.status(201).json({
    data: user
      ? {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          phone: user.phone,
          status: user.status,
          createdAt: user.createdAt,
        }
      : { id },
  });
};

export const update = async (req: Request, res: Response) => {
  const tenant = requireTenant(req);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid user id');

  const target = await findUserById(tenant.id, id);
  if (!target) throw ApiError.notFound('User not found');

  const body = asObject(req.body);
  const patch: { role?: string; status?: string; phone?: string | null } = {};

  if (body.role !== undefined) {
    const role = requireString(body.role, 'role', { max: 50 });
    if (!ROLES.has(role)) throw ApiError.badRequest('Invalid role');
    patch.role = role;
  }
  if (body.status !== undefined) {
    const status = requireString(body.status, 'status', { max: 20 });
    if (!STATUSES.has(status)) throw ApiError.badRequest('Invalid status');
    patch.status = status;
  }
  if (body.phone !== undefined) {
    patch.phone = optionalString(body.phone, 'phone', { max: 20 });
  }

  if (!Object.keys(patch).length) throw ApiError.badRequest('No supported fields to update');

  if (req.auth?.userId === id) {
    if (patch.role && patch.role !== 'admin') {
      throw ApiError.badRequest('You cannot remove your own admin role');
    }
    if (patch.status && patch.status !== 'active') {
      throw ApiError.badRequest('You cannot disable your own account');
    }
  }

  await updateUser(tenant.id, id, patch);
  const updated = await findUserById(tenant.id, id);
  res.json({
    data: updated
      ? {
          id: updated.id,
          username: updated.username,
          email: updated.email,
          role: updated.role,
          phone: updated.phone,
          status: updated.status,
        }
      : { id },
  });
};

export const remove = async (req: Request, res: Response) => {
  const tenant = requireTenant(req);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid user id');

  if (req.auth?.userId === id) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  const target = await findUserById(tenant.id, id);
  if (!target) throw ApiError.notFound('User not found');

  if (target.role === 'admin') {
    const stats = await userStats(tenant.id);
    if (stats.admins <= 1) throw ApiError.badRequest('Cannot delete the last admin');
  }

  await removeUser(tenant.id, id);
  res.status(204).end();
};
