import type { RequestHandler } from 'express';
import { ApiError } from '../utils/errors.js';
import { resolveTenantHost } from '../utils/requestHost.js';
import { resolveTenantByHost, resolveTenantBySlug } from '../services/tenantCache.js';

export { extractHost } from '../utils/requestHost.js';

export const tenantResolver: RequestHandler = async (req, _res, next) => {
  try {
    const slug = req.header('x-tenant');
    const host = resolveTenantHost({
      host: req.headers.host,
      origin: req.header('origin'),
      xTenantHost: req.header('x-tenant-host'),
      queryHost: typeof req.query.host === 'string' ? req.query.host : undefined,
    });
    const tenant = slug ? await resolveTenantBySlug(slug) : await resolveTenantByHost(host);

    if (!tenant) {
      return next(
        new ApiError(
          404,
          'tenant_not_found',
          slug ? `Unknown tenant "${slug}"` : `No tenant is configured for host "${host}"`,
        ),
      );
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    next(error);
  }
};
