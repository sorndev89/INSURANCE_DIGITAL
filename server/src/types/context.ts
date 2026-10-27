import type { PlanLimits, TenantSettings } from '../db/schema.js';

export type TenantStatus = 'active' | 'trial' | 'suspended';

export type TenantRoleContext = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  isAdmin: boolean;
  landingPath: string;
};

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
  roles: TenantRoleContext[];
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
