import cors from 'cors';
import { env } from '../config/env.js';
import { getVerifiedHostnames } from '../services/tenantCache.js';

const STATIC_ALLOWED = new Set(
  ['localhost', '127.0.0.1', '[::1]'].flatMap((host) => [
    `http://${host}:3000`,
    `http://${host}:3001`,
    `http://${host}:5055`,
  ]),
);

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);
const NATIVE_ORIGINS = new Set(['capacitor://localhost', 'ionic://localhost', 'https://localhost']);

export const normalizeOrigin = (value: string) => {
  try {
    const url = new URL(String(value).trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch {
    return '';
  }
};

export type OriginCheckInput = {
  origin: string;
  isProduction: boolean;
  adminHost: string;
  rootDomain: string;
  extraOrigins: string[];
  allowRootSubdomains: boolean;
  verifiedHostnames?: Set<string> | null;
};

export const evaluateOrigin = ({
  origin,
  isProduction,
  adminHost,
  rootDomain,
  extraOrigins,
  allowRootSubdomains,
  verifiedHostnames = null,
}: OriginCheckInput) => {
  const raw = String(origin || '').trim();
  if (!raw) return false;
  if (NATIVE_ORIGINS.has(raw.toLowerCase())) return true;

  const normalized = normalizeOrigin(raw);
  if (!normalized) return false;
  if (STATIC_ALLOWED.has(normalized)) return true;

  let hostname: string;
  try {
    hostname = new URL(normalized).hostname.toLowerCase();
  } catch {
    return false;
  }

  if (!isProduction && LOCAL_HOSTNAMES.has(hostname)) return true;

  const extras = new Set(
    extraOrigins.map((value) => normalizeOrigin(value)).filter(Boolean),
  );
  if (extras.has(normalized)) return true;

  const admin = adminHost.trim().toLowerCase().replace(/\.$/, '');
  const root = rootDomain.trim().toLowerCase().replace(/\.$/, '');
  if (hostname === admin) return true;
  if (hostname === root) return true;
  if (allowRootSubdomains && hostname.endsWith(`.${root}`)) return true;

  return verifiedHostnames?.has(hostname) ?? false;
};

export const isAllowedOrigin = async (origin: string) => {
  const base = evaluateOrigin({
    origin,
    isProduction: env.isProduction,
    adminHost: env.adminHost,
    rootDomain: env.rootDomain,
    extraOrigins: env.corsExtraOrigins,
    allowRootSubdomains: env.corsAllowRootSubdomains,
  });
  if (base) return true;

  const verifiedHostnames = await getVerifiedHostnames();
  return evaluateOrigin({
    origin,
    isProduction: env.isProduction,
    adminHost: env.adminHost,
    rootDomain: env.rootDomain,
    extraOrigins: env.corsExtraOrigins,
    allowRootSubdomains: env.corsAllowRootSubdomains,
    verifiedHostnames,
  });
};

export const corsMiddleware = cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    isAllowedOrigin(origin)
      .then((allowed) => callback(null, allowed))
      .catch(() => callback(null, false));
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 600,
});
