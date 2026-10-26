import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import type { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from './db/index.js';
import { env } from './config/env.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler, notFoundHandler } from './utils/errors.js';
import publicRoutes from './routes/public.js';
import platformRoutes from './routes/platform.js';
import { createTenantRouter } from './routes/tenant.js';
import internalRoutes from './routes/internal.js';

const resolveAdminDist = () => {
  const candidates = [
    process.env.ADMIN_DIST_PATH,
    path.resolve(process.cwd(), 'public/admin'),
    path.resolve(process.cwd(), '../admin/.output/public'),
    path.resolve(process.cwd(), 'admin/.output/public'),
  ].filter((value): value is string => Boolean(value));

  return candidates.find((dir) => fs.existsSync(path.join(dir, 'index.html'))) ?? null;
};

export const createApp = () => {
  const app = express();
  const adminDist = resolveAdminDist();
  if (adminDist) console.log(`[server] serving admin UI from ${adminDist}`);

  app.disable('x-powered-by');
  app.set('trust proxy', env.trustProxy);

  app.use(corsMiddleware);
  app.use(express.json({ limit: '1mb' }));

  const healthHandler = async (_req: Request, res: Response) => {
    try {
      await db.execute(sql`select 1`);
      res.json({ status: 'ok', uptime: process.uptime() });
    } catch {
      res.status(503).json({ status: 'unavailable' });
    }
  };

  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  app.use('/api/internal', internalRoutes);
  app.use('/internal', internalRoutes);

  app.use('/api/public', publicRoutes);
  app.use('/api/platform', platformRoutes);
  app.use('/api/tenant', createTenantRouter());
  app.use('/api', createTenantRouter({ legacy: true }));

  if (adminDist) {
    app.use(express.static(adminDist, { index: false, redirect: false, maxAge: '1h' }));

    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      if (req.path === '/health') return next();
      if (req.path.startsWith('/api/') || req.path.startsWith('/internal/')) return next();
      if (path.extname(req.path)) return next();
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(adminDist, 'index.html'), { dotfiles: 'allow' });
    });

    app.get('/', (_req, res) => {
      res.sendFile(path.join(adminDist, 'index.html'), { dotfiles: 'allow' });
    });
  } else {
    app.get('/', (_req, res) => {
      res.json({ name: 'SAIYFON Insurance API', status: 'ok' });
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
