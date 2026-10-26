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

export const isAllowedOrigin = async (origin: string) => {
  if (STATIC_ALLOWED.has(origin)) return true;
  if (NATIVE_ORIGINS.has(origin)) return true;
  if (env.corsExtraOrigins.includes(origin)) return true;

  let hostname: string;
  try {
    hostname = new URL(origin).hostname.toLowerCase();
  } catch {
    return false;
  }

  // Dev servers (Vite/Nuxt) may pick any port.
  if (!env.isProduction && LOCAL_HOSTNAMES.has(hostname)) return true;

  if (hostname === env.adminHost) return true;
  if (hostname === env.rootDomain || hostname.endsWith(`.${env.rootDomain}`)) return true;

  const verifiedHostnames = await getVerifiedHostnames();
  return verifiedHostnames.has(hostname);
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
