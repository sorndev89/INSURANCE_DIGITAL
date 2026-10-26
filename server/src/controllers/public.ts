import type { Request, Response } from 'express';
import { resolveTenantByHost, resolveTenantBySlug } from '../services/tenantCache.js';
import { resolveTenantHost } from '../utils/requestHost.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/errors.js';
import { activePlans } from './plans.js';

export const config = (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.json({
    data: {
      rootDomain: env.rootDomain,
      adminHost: env.adminHost,
      cnameTarget: env.cnameTarget,
    },
  });
};

export const tenant = async (req: Request, res: Response) => {
  const slug = typeof req.query.slug === 'string' ? req.query.slug.trim() : '';
  const host = resolveTenantHost({
    host: req.headers.host,
    origin: req.header('origin'),
    xTenantHost: req.header('x-tenant-host'),
    queryHost: typeof req.query.host === 'string' ? req.query.host : undefined,
  });
  const resolved = slug ? await resolveTenantBySlug(slug) : await resolveTenantByHost(host);

  if (!resolved) {
    throw new ApiError(
      404,
      'tenant_not_found',
      slug ? `Unknown tenant "${slug}"` : `No tenant is configured for host "${host}"`,
    );
  }

  res.setHeader('Cache-Control', 'public, max-age=30');
  res.json({
    data: {
      slug: resolved.slug,
      name: resolved.name,
      status: resolved.status,
      hostname: resolved.hostname,
      branding: resolved.settings?.brand ?? { name: resolved.name },
      locale: resolved.settings?.locale ?? 'lo',
      currency: resolved.settings?.currency ?? 'LAK',
      timezone: resolved.settings?.timezone ?? 'Asia/Vientiane',
      features: resolved.features,
    },
  });
};

export const plans = activePlans;
