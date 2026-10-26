import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

export type TenantTokenPayload = {
  uid: number;
  tid: number;
  email: string;
  role: string;
  typ: 'tenant';
};

export type PlatformTokenPayload = {
  pid: number;
  email: string;
  role: 'superadmin' | 'support';
  typ: 'platform';
};

const TENANT_AUDIENCE = 'tenant';
const PLATFORM_AUDIENCE = 'platform';
const TENANT_TOKEN_TTL = process.env.TENANT_TOKEN_TTL || '1d';
const PLATFORM_TOKEN_TTL = process.env.PLATFORM_TOKEN_TTL || '8h';

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

const sign = (
  payload: TenantTokenPayload | PlatformTokenPayload,
  secret: string,
  audience: string,
  expiresIn: string,
) =>
  jwt.sign(payload, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    audience,
    issuer: env.jwtIssuer,
  });

const verify = (token: string, secret: string, audience: string) => {
  const decoded = jwt.verify(token, secret, {
    audience,
    issuer: env.jwtIssuer,
  });
  if (typeof decoded === 'string') {
    throw new Error('Invalid token payload');
  }
  return decoded as Record<string, unknown>;
};

export const generateTenantToken = (user: {
  id: number;
  tenantId: number | null;
  email: string;
  role: string;
}) => {
  if (user.tenantId === null) {
    throw new Error('Cannot issue a tenant token without a tenant');
  }
  return sign(
    { uid: user.id, tid: user.tenantId, email: user.email, role: user.role, typ: 'tenant' },
    env.jwtSecret,
    TENANT_AUDIENCE,
    TENANT_TOKEN_TTL,
  );
};

export const generatePlatformToken = (user: {
  id: number;
  email: string;
  role: 'superadmin' | 'support';
}) =>
  sign(
    { pid: user.id, email: user.email, role: user.role, typ: 'platform' },
    env.platformJwtSecret,
    PLATFORM_AUDIENCE,
    PLATFORM_TOKEN_TTL,
  );

export const verifyTenantToken = (token: string): TenantTokenPayload => {
  const decoded = verify(token, env.jwtSecret, TENANT_AUDIENCE);
  if (decoded.typ !== 'tenant') throw new Error('Invalid token audience');
  return decoded as unknown as TenantTokenPayload;
};

export const verifyPlatformToken = (token: string): PlatformTokenPayload => {
  const decoded = verify(token, env.platformJwtSecret, PLATFORM_AUDIENCE);
  if (decoded.typ !== 'platform') throw new Error('Invalid token audience');
  return decoded as unknown as PlatformTokenPayload;
};
