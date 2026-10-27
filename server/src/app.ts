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
  app.use(express.json({ limit: '10mb' }));

  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsDir, { maxAge: env.isProduction ? '7d' : 0 }));

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
    app.use(express.static(adminDist, { index: false, redirect: false, maxAge: env.isProduction ? '1h' : 0 }));

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
    app.get('/', (req, res) => {
      if (req.accepts('html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(`<!DOCTYPE html>
<html lang="lo">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SAIYFON Insurance Digital · SaaS Core Platform</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {
      --primary: #047857;
      --primary-light: #10b981;
      --bg: #090e17;
      --surface: rgba(19, 28, 46, 0.75);
      --border: rgba(255, 255, 255, 0.1);
      --text: #f8fafc;
      --muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Noto Sans Lao', system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      position: relative;
      overflow-x: hidden;
    }
    .glow-1 {
      position: absolute;
      top: -100px;
      left: -100px;
      width: 450px;
      height: 450px;
      background: rgba(4, 120, 87, 0.25);
      filter: blur(140px);
      border-radius: 50%;
      pointer-events: none;
    }
    .glow-2 {
      position: absolute;
      bottom: -100px;
      right: -100px;
      width: 450px;
      height: 450px;
      background: rgba(16, 185, 129, 0.2);
      filter: blur(140px);
      border-radius: 50%;
      pointer-events: none;
    }
    .card {
      position: relative;
      max-width: 600px;
      width: 100%;
      background: var(--surface);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border);
      border-radius: 28px;
      padding: 2.5rem 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 0.35rem 1rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
    }
    .badge-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #ffffff 40%, #a7f3d0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: var(--muted);
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    @media (min-width: 640px) {
      .actions { flex-direction: row; justify-content: center; }
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.8rem 1.6rem;
      border-radius: 9999px;
      font-size: 0.9rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-primary {
      background: linear-gradient(135deg, #059669, #047857);
      color: #ffffff;
      box-shadow: 0 10px 20px -5px rgba(4, 120, 87, 0.4);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 25px -5px rgba(4, 120, 87, 0.5);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-2px);
    }
    .footer-meta {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: var(--muted);
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.2); }
    }
  </style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>
  <div class="card">
    <div class="badge">
      <span class="badge-dot"></span>
      <span>SAAS CORE API ONLINE · V2.0</span>
    </div>
    <h1>SAIYFON Insurance Digital</h1>
    <p>ສູນກາງລະບົບປະກັນໄພດິຈິຕອນ Multi-tenant SaaS Core API & Microservices Platform.</p>
    
    <div class="actions">
      <a href="http://localhost:3001" class="btn btn-primary">
        <span>🌐 ເປີດ Tenant Portal (3001)</span>
      </a>
      <a href="/api/health" class="btn btn-secondary">
        <span>⚡ ກວດສອບ API Health</span>
      </a>
    </div>

    <div class="footer-meta">
      <span>Database: Connected (Drizzle ORM)</span>
      <span>Uptime: Active</span>
    </div>
  </div>
</body>
</html>`);
      }

      res.json({
        name: 'SAIYFON Insurance Digital Core API',
        status: 'ok',
        version: '2.0.0',
        portalUrl: 'http://localhost:3001',
        uptimeSeconds: Math.floor(process.uptime()),
      });
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
