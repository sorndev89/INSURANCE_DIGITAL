import type { RequestHandler } from 'express';
import { verifyTenantToken } from '../utils/auth.js';
import { ApiError } from '../utils/errors.js';

export const getBearerToken = (header: string | undefined) => {
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
};

export const authMiddleware: RequestHandler = (req, _res, next) => {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    return next(ApiError.unauthorized('No token provided'));
  }

  try {
    const claims = verifyTenantToken(token);
    if (req.tenant && req.tenant.id !== claims.tid) {
      return next(ApiError.forbidden('Token does not belong to this tenant'));
    }
    req.auth = {
      userId: claims.uid,
      tenantId: claims.tid,
      email: claims.email,
      role: claims.role,
    };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};

export const requireRole =
  (...roles: string[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.auth) return next(ApiError.unauthorized());
    if (!roles.includes(req.auth.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };

export const requirePermission =
  (permission: string): RequestHandler =>
  (req, _res, next) => {
    if (!req.auth) return next(ApiError.unauthorized());
    if (!req.tenant) return next(ApiError.badRequest('Tenant context is required'));

    const role = req.tenant.roles.find((item) => item.key === req.auth?.role);
    if (!role) {
      return next(ApiError.forbidden('Role is no longer available'));
    }
    if (role.isAdmin) return next();
    if (role.permissions.includes('*') || role.permissions.includes(permission)) {
      return next();
    }
    return next(ApiError.forbidden('Insufficient permissions'));
  };
