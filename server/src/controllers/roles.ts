import type { Request, Response } from 'express';
import { ApiError } from '../utils/errors.js';
import { PERMISSION_GROUPS, SYSTEM_PERMISSION_GROUP, LANDING_PATHS } from '../config/permissions.js';
import {
  createRole,
  deleteRole,
  findRoleById,
  listRoleOptions,
  listRoles,
  updateRole,
} from '../services/roles.js';
import { invalidateTenantCache } from '../services/tenantCache.js';
import { writeAuditLog } from '../services/audit.js';

const tenantContext = (req: Request) => {
  if (!req.tenant) throw ApiError.badRequest('Tenant context is required');
  return req.tenant;
};

const requireRoleId = (req: Request) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw ApiError.badRequest('Invalid role id');
  return id;
};

export const list = async (req: Request, res: Response) => {
  const tenant = tenantContext(req);
  res.json({ data: await listRoles(tenant.id) });
};

export const options = async (req: Request, res: Response) => {
  const tenant = tenantContext(req);
  res.json({ data: await listRoleOptions(tenant.id) });
};

export const catalog = (_req: Request, res: Response) => {
  res.json({
    data: {
      groups: PERMISSION_GROUPS,
      system: SYSTEM_PERMISSION_GROUP,
      landingPaths: LANDING_PATHS,
    },
  });
};

export const create = async (req: Request, res: Response) => {
  const tenant = tenantContext(req);
  const role = await createRole(tenant.id, req.body);
  await invalidateTenantCache();

  await writeAuditLog({
    actorId: req.auth?.userId ?? null,
    tenantId: tenant.id,
    action: 'tenant.role.create',
    target: role.key,
    ip: req.ip,
    meta: { name: role.name, permissions: role.permissions },
  });

  res.status(201).json({ data: role });
};

export const update = async (req: Request, res: Response) => {
  const tenant = tenantContext(req);
  const id = requireRoleId(req);
  const role = await updateRole(tenant.id, id, req.body);
  await invalidateTenantCache();

  await writeAuditLog({
    actorId: req.auth?.userId ?? null,
    tenantId: tenant.id,
    action: 'tenant.role.update',
    target: role.key,
    ip: req.ip,
    meta: { name: role.name, permissions: role.permissions },
  });

  res.json({ data: role });
};

export const remove = async (req: Request, res: Response) => {
  const tenant = tenantContext(req);
  const id = requireRoleId(req);
  const role = await findRoleById(tenant.id, id);
  if (!role) throw ApiError.notFound('Role not found');

  await deleteRole(tenant.id, id);
  await invalidateTenantCache();

  await writeAuditLog({
    actorId: req.auth?.userId ?? null,
    tenantId: tenant.id,
    action: 'tenant.role.delete',
    target: role.key,
    ip: req.ip,
    meta: { name: role.name },
  });

  res.json({ data: { id } });
};
