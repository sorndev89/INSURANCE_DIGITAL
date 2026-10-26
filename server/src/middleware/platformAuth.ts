import type { RequestHandler } from 'express';
import { verifyPlatformToken } from '../utils/auth.js';
import { ApiError } from '../utils/errors.js';
import { getBearerToken } from './auth.js';

export const platformAuthMiddleware: RequestHandler = (req, _res, next) => {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    return next(ApiError.unauthorized('No platform token provided'));
  }

  try {
    const claims = verifyPlatformToken(token);
    req.platformAuth = {
      platformUserId: claims.pid,
      email: claims.email,
      role: claims.role,
    };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired platform token'));
  }
};

export const requirePlatformRole =
  (...roles: Array<'superadmin' | 'support'>): RequestHandler =>
  (req, _res, next) => {
    if (!req.platformAuth) return next(ApiError.unauthorized());
    if (!roles.includes(req.platformAuth.role)) {
      return next(ApiError.forbidden('Insufficient platform permissions'));
    }
    next();
  };
