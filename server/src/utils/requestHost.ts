export const extractHost = (hostHeader: string | undefined) =>
  (hostHeader || '').split(',')[0].trim().toLowerCase().replace(/:\d+$/, '');

const originHostname = (origin: string | undefined) => {
  const raw = String(origin || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.hostname;
  } catch {
    return '';
  }
};

export type RequestHostInput = {
  host?: string;
  origin?: string;
  xTenantHost?: string;
  queryHost?: string;
};

// Resolve the tenant host from the browser page, not from the API host. Cross-origin
// requests always carry the API host in `Host`, so `Origin`/`X-Tenant-Host`/`?host=`
// must take precedence for tenant resolution.
export const resolveTenantHost = ({ host, origin, xTenantHost, queryHost }: RequestHostInput) =>
  extractHost(xTenantHost || queryHost || originHostname(origin) || host);
