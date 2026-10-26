import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tenants } from '../db/schema.js';
import { ApiError } from '../utils/errors.js';
import { asObject, parseCurrencyDisplay } from '../utils/validate.js';
import { invalidateTenantCache } from '../services/tenantCache.js';
import { writeAuditLog } from '../services/audit.js';

const tenantContext = (req: Request) => {
  if (!req.tenant) throw ApiError.badRequest('Tenant context is required');
  return req.tenant;
};

export const get = async (req: Request, res: Response) => {
  const tenant = tenantContext(req);
  res.json({
    data: {
      currency: tenant.settings?.currency ?? 'LAK',
      currencyDisplay: tenant.settings?.currencyDisplay ?? null,
    },
  });
};

export const update = async (req: Request, res: Response) => {
  const tenant = tenantContext(req);
  const body = asObject(req.body);
  if (!Object.prototype.hasOwnProperty.call(body, 'currencyDisplay')) {
    throw ApiError.badRequest('currencyDisplay is required');
  }

  const currencyDisplay = parseCurrencyDisplay(body.currencyDisplay);
  if (currencyDisplay === undefined) {
    throw ApiError.badRequest('currencyDisplay is required');
  }

  const settings = {
    ...(tenant.settings ?? {}),
    currencyDisplay,
  };

  await db.update(tenants).set({ settings }).where(eq(tenants.id, tenant.id));
  await invalidateTenantCache();

  await writeAuditLog({
    actorId: req.auth?.userId ?? null,
    tenantId: tenant.id,
    action: 'tenant.settings.update',
    target: tenant.slug,
    ip: req.ip,
    meta: { currencyDisplay },
  });

  res.json({ data: { currencyDisplay } });
};
