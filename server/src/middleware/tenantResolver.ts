import type { RequestHandler } from 'express';
import { ApiError } from '../utils/errors.js';
import { resolveTenantByHost, resolveTenantBySlug } from '../services/tenantCache.js';

export const extractHost = (hostHeader: string | undefined) =>
  (hostHeader || '').split(',')[0].trim().toLowerCase().replace(/:\d+$/, '');

export const tenantResolver: RequestHandler = async (req, _res, next) => {
  try {
    const slug = req.header('x-tenant');
    const tenant = slug
      ? await resolveTenantBySlug(slug)
      : await resolveTenantByHost(extractHost(req.headers.host));

    if (!tenant) {
      return next(
        new ApiError(
          404,
          'tenant_not_found',
          slug
            ? `Unknown tenant "${slug}"`
            : `No tenant is configured for host "${extractHost(req.headers.host)}"`,
        ),
      );
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    next(error);
  }
};
