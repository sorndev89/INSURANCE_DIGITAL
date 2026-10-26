import type { RequestHandler } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { policies, users } from '../db/schema.js';
import { ApiError } from '../utils/errors.js';
import { toNumber } from '../utils/list.js';

type LimitMetric = 'maxUsers' | 'maxPolicies';

export const enforcePlanLimit =
  (metric: LimitMetric): RequestHandler =>
  async (req, _res, next) => {
    try {
      if (!req.tenant) return next(ApiError.badRequest('Tenant context is required'));
      const limit = req.tenant.limits?.[metric];
      if (!limit || limit <= 0) return next();

      const table = metric === 'maxUsers' ? users : policies;
      const [row] = await db
        .select({ total: sql<number>`count(*)` })
        .from(table)
        .where(eq(table.tenantId, req.tenant.id));
      const total = toNumber(row?.total);

      if (total >= limit) {
        return next(
          new ApiError(
            403,
            'plan_limit_reached',
            `Plan limit reached for ${metric} (${limit})`,
            { metric, limit, current: total },
          ),
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
