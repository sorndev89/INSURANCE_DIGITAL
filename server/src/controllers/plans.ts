import type { Request, Response } from 'express';
import { asc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { plans } from '../db/schema.js';
import { ApiError } from '../utils/errors.js';
import { asObject, optionalString, requireString } from '../utils/validate.js';
import { writeAuditLog } from '../services/audit.js';
import { invalidateTenantCache } from '../services/tenantCache.js';

const parseLimits = (value: unknown) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw ApiError.badRequest('limits must be an object');
  }
  return value as { maxUsers?: number; maxPolicies?: number; storageMb?: number };
};

const parseFeatures = (value: unknown) => {
  if (value === undefined || value === null) return null;
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw ApiError.badRequest('features must be an array of strings');
  }
  return value as string[];
};

export const list = async (_req: Request, res: Response) => {
  const items = await db.select().from(plans).orderBy(asc(plans.id));
  res.json({ data: items });
};

export const create = async (req: Request, res: Response) => {
  const body = asObject(req.body);
  const code = requireString(body.code, 'code', { min: 2, max: 50 }).toLowerCase();
  const name = requireString(body.name, 'name', { min: 2, max: 255 });
  const description = optionalString(body.description, 'description', { max: 2000 });
  const price = body.price === undefined ? '0.00' : String(Number(body.price));
  if (Number.isNaN(Number(price))) throw ApiError.badRequest('price must be a number');
  const currency = optionalString(body.currency, 'currency', { max: 10 }) || 'LAK';

  const [result] = await db.insert(plans).values({
    code,
    name,
    description,
    price,
    currency,
    limits: parseLimits(body.limits),
    features: parseFeatures(body.features),
    active: body.active === undefined ? true : Boolean(body.active),
  });

  await invalidateTenantCache();
  await writeAuditLog({
    actorId: req.platformAuth?.platformUserId ?? null,
    ip: req.ip,
    action: 'plan.create',
    target: code,
    meta: { planId: result.insertId },
  });

  const [plan] = await db.select().from(plans).where(eq(plans.id, result.insertId)).limit(1);
  res.status(201).json({ data: plan });
};

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid plan id');

  const body = asObject(req.body);
  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = requireString(body.name, 'name', { max: 255 });
  if (body.description !== undefined) {
    patch.description = optionalString(body.description, 'description', { max: 2000 });
  }
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price)) throw ApiError.badRequest('price must be a number');
    patch.price = String(price);
  }
  if (body.currency !== undefined) {
    patch.currency = requireString(body.currency, 'currency', { max: 10 });
  }
  if (body.limits !== undefined) patch.limits = parseLimits(body.limits);
  if (body.features !== undefined) patch.features = parseFeatures(body.features);
  if (body.active !== undefined) patch.active = Boolean(body.active);

  if (!Object.keys(patch).length) throw ApiError.badRequest('No supported fields to update');

  await db.update(plans).set(patch).where(eq(plans.id, id));
  const [plan] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  if (!plan) throw ApiError.notFound('Plan not found');

  await invalidateTenantCache();
  await writeAuditLog({
    actorId: req.platformAuth?.platformUserId ?? null,
    ip: req.ip,
    action: 'plan.update',
    target: plan.code,
    meta: patch,
  });

  res.json({ data: plan });
};

export const activePlans = async (_req: Request, res: Response) => {
  const items = await db
    .select({
      code: plans.code,
      name: plans.name,
      description: plans.description,
      price: plans.price,
      currency: plans.currency,
      limits: plans.limits,
      features: plans.features,
    })
    .from(plans)
    .where(eq(plans.active, true))
    .orderBy(asc(plans.price), asc(plans.id));
  res.json({ data: items });
};
