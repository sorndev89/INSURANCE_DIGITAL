import type { PlanLimits, TenantSettings } from '../db/schema.js';

export type TenantStatus = 'active' | 'trial' | 'suspended';

export type TenantContext = {
  id: number;
  slug: string;
  name: string;
  status: TenantStatus;
  planId: number | null;
  settings: TenantSettings | null;
  features: string[];
  limits: PlanLimits | null;
  hostname: string | null;
};

export type AuthContext = {
  userId: number;
  tenantId: number;
  email: string;
  role: string;
};

export type PlatformAuthContext = {
  platformUserId: number;
  email: string;
  role: 'superadmin' | 'support';
};

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
      auth?: AuthContext;
      platformAuth?: PlatformAuthContext;
    }
  }
}

export {};
