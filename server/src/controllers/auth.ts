import type { Request, Response } from 'express';
import { comparePassword, generateTenantToken, hashPassword } from '../utils/auth.js';
import { ApiError } from '../utils/errors.js';
import { asObject, optionalString, requireEmail, requirePassword } from '../utils/validate.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
} from '../repositories/users.js';

const assertTenantUsable = (req: Request) => {
  if (!req.tenant) {
    throw ApiError.badRequest('Tenant context is required');
  }
  if (req.tenant.status === 'suspended') {
    throw ApiError.forbidden('Tenant is suspended');
  }
  return req.tenant;
};

const usernameFromEmail = (email: string) =>
  email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 50) || 'user';

export const register = async (req: Request, res: Response) => {
  const tenant = assertTenantUsable(req);
  const body = asObject(req.body);
  const email = requireEmail(body.email);
  const password = requirePassword(body.password);
  const username = optionalString(body.username, 'username', { min: 2, max: 255 });
  const phone = optionalString(body.phone, 'phone', { max: 20 });

  const existing = await findUserByEmail(tenant.id, email);
  if (existing) {
    throw ApiError.conflict('Email is already registered for this tenant');
  }

  const passwordHash = await hashPassword(password);

  const id = await createUser(tenant.id, {
    username: username || usernameFromEmail(email),
    email,
    password: passwordHash,
    role: 'customer',
    phone,
    status: 'active',
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
        }
      : { id },
  });
};

export const login = async (req: Request, res: Response) => {
  const tenant = assertTenantUsable(req);
  const body = asObject(req.body);
  const email = requireEmail(body.email);
  const password = requirePassword(body.password);

  const user = await findUserByEmail(tenant.id, email);
  if (!user || !(await comparePassword(password, user.password))) {
    throw new ApiError(401, 'invalid_credentials', 'Invalid email or password');
  }
  if (user.status !== 'active') {
    throw ApiError.forbidden('This account is disabled');
  }

  const token = generateTenantToken(user);
  res.json({
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
      },
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        status: tenant.status,
        branding: tenant.settings?.brand ?? null,
        features: tenant.features,
      },
    },
  });
};

export const me = async (req: Request, res: Response) => {
  if (!req.auth) throw ApiError.unauthorized();
  const user = await findUserById(req.auth.tenantId, req.auth.userId);
  if (!user) throw ApiError.unauthorized('User no longer exists');
  res.json({
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.status,
      createdAt: user.createdAt,
    },
  });
};
