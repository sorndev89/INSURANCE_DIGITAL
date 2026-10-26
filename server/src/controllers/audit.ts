import type { Request, Response } from 'express';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { platformAuditLogs, platformUsers } from '../db/schema.js';
import { parsePagination } from '../utils/validate.js';

export const list = async (req: Request, res: Response) => {
  const { page, pageSize, offset } = parsePagination(req.query as Record<string, unknown>);
  const tenantId = req.query.tenantId ? Number(req.query.tenantId) : null;
  const action = typeof req.query.action === 'string' ? req.query.action : null;

  const filters = [
    tenantId && Number.isInteger(tenantId) ? eq(platformAuditLogs.tenantId, tenantId) : undefined,
    action ? eq(platformAuditLogs.action, action) : undefined,
  ].filter(Boolean);

  const where = filters.length ? and(...filters) : undefined;

  const items = await db
    .select({
      id: platformAuditLogs.id,
      action: platformAuditLogs.action,
      target: platformAuditLogs.target,
      tenantId: platformAuditLogs.tenantId,
      ip: platformAuditLogs.ip,
      meta: platformAuditLogs.meta,
      createdAt: platformAuditLogs.createdAt,
      actorId: platformAuditLogs.actorId,
      actorEmail: platformUsers.email,
    })
    .from(platformAuditLogs)
    .leftJoin(platformUsers, eq(platformUsers.id, platformAuditLogs.actorId))
    .where(where)
    .orderBy(desc(platformAuditLogs.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(platformAuditLogs)
    .where(where);

  res.json({
    data: items,
    meta: { total: Number(totalRow?.total ?? 0), page, pageSize },
  });
};
