import { db } from '../db/index.js';
import { platformAuditLogs } from '../db/schema.js';

export type AuditInput = {
  actorId?: number | null;
  tenantId?: number | null;
  action: string;
  target?: string | null;
  ip?: string | null;
  meta?: Record<string, unknown> | null;
};

export const writeAuditLog = async (input: AuditInput) => {
  try {
    await db.insert(platformAuditLogs).values({
      actorId: input.actorId ?? null,
      tenantId: input.tenantId ?? null,
      action: input.action,
      target: input.target ?? null,
      ip: input.ip ?? null,
      meta: input.meta ?? null,
    });
  } catch (error) {
    console.error('[audit] failed to write log:', error);
  }
};
