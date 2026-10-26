import { Router } from 'express';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { tenantResolver } from '../middleware/tenantResolver.js';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import { createTenantDataRouter } from './tenantData.js';

const LEGACY_SUNSET = process.env.API_LEGACY_SUNSET || 'Sat, 31 Jan 2027 00:00:00 GMT';
const loggedLegacyPaths = new Set<string>();

const legacyHeaders: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Deprecation', 'true');
  res.setHeader('Sunset', LEGACY_SUNSET);
  const suffix = req.originalUrl.replace(/^\/api\/?/, '');
  res.setHeader('Link', `</api/tenant/${suffix}>; rel="successor-version"`);

  const key = `${req.method} ${req.path}`;
  if (!loggedLegacyPaths.has(key)) {
    loggedLegacyPaths.add(key);
    console.warn(`[legacy-api] ${req.method} ${req.originalUrl} -> /api/tenant`);
  }
  next();
};

export const createTenantRouter = ({ legacy = false }: { legacy?: boolean } = {}) => {
  const router = Router();
  const gate: RequestHandler[] = legacy ? [legacyHeaders, tenantResolver] : [tenantResolver];

  router.use('/auth', ...gate, authRoutes);
  router.use('/users', ...gate, userRoutes);
  router.use('/', createTenantDataRouter(gate));

  return router;
};
