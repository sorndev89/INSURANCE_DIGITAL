import type { Request, Response } from 'express';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from '../db/schema.js';
import { hashPassword } from '../utils/auth.js';
import { ApiError } from '../utils/errors.js';
import {
  asObject,
  optionalAvatar,
  optionalString,
  parsePagination,
  requireEmail,
  requirePassword,
  requireString,
} from '../utils/validate.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  listUsers,
  removeUser,
  updateUser,
  userStats,
  type UserSort,
} from '../repositories/users.js';
import { roleExists } from '../services/roles.js';

const STATUSES = new Set(['active', 'inactive', 'suspended']);
const SORT_KEYS = new Set(['name', 'username', 'email', 'role', 'status', 'phone', 'createdAt']);

type UserRow = InferSelectModel<typeof users>;

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

const serializeUser = (user: UserRow) => ({
  id: user.id,
  name: user.name || user.username,
  username: user.username,
  email: user.email,
  role: user.role,
  phone: user.phone,
  avatar: user.profilePhotoPath,
  status: user.status,
  createdAt: user.createdAt,
});

const parseSort = (value: unknown): UserSort | null => {
  if (typeof value !== 'string') return null;
  const [key, order] = value.split(':');
  if (!key || !SORT_KEYS.has(key)) return null;
  return { key: key as UserSort['key'], order: order === 'asc' ? 'asc' : 'desc' };
};

const parseStatus = (value: unknown) => {
  const status = requireString(value, 'status', { max: 20 });
  if (!STATUSES.has(status)) throw ApiError.badRequest('Invalid status');
  return status;
};

export const list = async (req: Request, res: Response) => {
  const tenant = requireTenant(req);
  const { page, pageSize } = parsePagination(req.query as Record<string, unknown>);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const role = typeof req.query.role === 'string' ? req.query.role : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const sort = parseSort(req.query.sort);
  const result = await listUsers(tenant.id, { search, page, pageSize, role, status, sort });
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
  const name = optionalString(body.name, 'name', { min: 2, max: 255 });
  const usernameInput = optionalString(body.username, 'username', { min: 2, max: 255 });
  const phone = optionalString(body.phone, 'phone', { max: 20 });
  const role = optionalString(body.role, 'role', { max: 50 }) || 'staff';
  const status = body.status === undefined ? 'active' : parseStatus(body.status);
  const profilePhotoPath = optionalAvatar(body.avatar ?? body.profilePhotoPath);

  if (!(await roleExists(tenant.id, role))) throw ApiError.badRequest('Invalid role');

  const username = usernameInput || usernameFromEmail(email);

  const existingEmail = await findUserByEmail(tenant.id, email);
  if (existingEmail) throw ApiError.conflict('Email is already registered for this tenant');

  const existingUsername = await findUserByUsername(tenant.id, username);
  if (existingUsername) throw ApiError.conflict('Username is already taken for this tenant');

  const id = await createUser(tenant.id, {
    name: name || username,
    username,
    email,
    password: await hashPassword(password),
    role,
    phone,
    status,
    profilePhotoPath,
  });

  const user = await findUserById(tenant.id, id);
  res.status(201).json({ data: user ? serializeUser(user) : { id } });
};

export const update = async (req: Request, res: Response) => {
  const tenant = requireTenant(req);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid user id');

  const target = await findUserById(tenant.id, id);
  if (!target) throw ApiError.notFound('User not found');

  const body = asObject(req.body);
  const patch: {
    name?: string | null;
    username?: string;
    email?: string;
    password?: string;
    role?: string;
    status?: string;
    phone?: string | null;
    profilePhotoPath?: string | null;
  } = {};

  if (body.name !== undefined) {
    patch.name = optionalString(body.name, 'name', { min: 2, max: 255 });
  }
  if (body.username !== undefined) {
    const username = requireString(body.username, 'username', { min: 2, max: 255 });
    const existing = await findUserByUsername(tenant.id, username);
    if (existing && existing.id !== id) {
      throw ApiError.conflict('Username is already taken for this tenant');
    }
    patch.username = username;
  }
  if (body.email !== undefined) {
    const email = requireEmail(body.email);
    const existing = await findUserByEmail(tenant.id, email);
    if (existing && existing.id !== id) {
      throw ApiError.conflict('Email is already registered for this tenant');
    }
    patch.email = email;
  }
  if (body.password !== undefined && body.password !== null && body.password !== '') {
    patch.password = await hashPassword(requirePassword(body.password));
  }
  if (body.role !== undefined) {
    const role = requireString(body.role, 'role', { max: 50 });
    if (!(await roleExists(tenant.id, role))) throw ApiError.badRequest('Invalid role');
    patch.role = role;
  }
  if (body.status !== undefined) {
    patch.status = parseStatus(body.status);
  }
  if (body.phone !== undefined) {
    patch.phone = optionalString(body.phone, 'phone', { max: 20 });
  }
  if (body.avatar !== undefined || body.profilePhotoPath !== undefined) {
    patch.profilePhotoPath = optionalAvatar(body.avatar ?? body.profilePhotoPath);
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
  res.json({ data: updated ? serializeUser(updated) : { id } });
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
