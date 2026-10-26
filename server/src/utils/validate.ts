import { ApiError } from './errors.js';
import type { CurrencyDisplay } from '../db/schema.js';

export const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export const requireString = (
  value: unknown,
  field: string,
  { min = 1, max = 255, trim = true }: { min?: number; max?: number; trim?: boolean } = {},
) => {
  if (typeof value !== 'string') {
    throw ApiError.badRequest(`${field} must be a string`);
  }
  const result = trim ? value.trim() : value;
  if (result.length < min) {
    throw ApiError.badRequest(`${field} must be at least ${min} characters`);
  }
  if (result.length > max) {
    throw ApiError.badRequest(`${field} must be at most ${max} characters`);
  }
  return result;
};

export const optionalString = (
  value: unknown,
  field: string,
  options: { min?: number; max?: number } = {},
) => {
  if (value === undefined || value === null || value === '') return null;
  return requireString(value, field, options);
};

export const requireEmail = (value: unknown, field = 'email') => {
  const email = requireString(value, field, { max: 255 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw ApiError.badRequest(`${field} must be a valid email address`);
  }
  return email;
};

export const requirePassword = (value: unknown, field = 'password') => {
  const password = requireString(value, field, { min: 8, max: 128, trim: false });
  return password;
};

export const requireSlug = (value: unknown, field = 'slug') => {
  const slug = requireString(value, field, { min: 2, max: 63 }).toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(slug)) {
    throw ApiError.badRequest(
      `${field} may only contain lowercase letters, numbers and hyphens, and cannot start or end with a hyphen`,
    );
  }
  return slug;
};

export const requireHostname = (value: unknown, field = 'hostname') => {
  const hostname = requireString(value, field, { min: 3, max: 255 }).toLowerCase();
  if (
    !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(hostname)
  ) {
    throw ApiError.badRequest(`${field} must be a valid domain name`);
  }
  return hostname;
};

export const optionalNumber = (value: unknown, field: string) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw ApiError.badRequest(`${field} must be a number`);
  }
  return parsed;
};

export const parseCurrencyDisplay = (
  value: unknown,
): CurrencyDisplay | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw ApiError.badRequest('currencyDisplay must be an object');
  }

  const input = value as Record<string, unknown>;
  if (input.symbol !== 'kip' && input.symbol !== 'lak') {
    throw ApiError.badRequest('currencyDisplay.symbol must be kip or lak');
  }
  if (input.position !== 'prefix' && input.position !== 'suffix') {
    throw ApiError.badRequest('currencyDisplay.position must be prefix or suffix');
  }

  return { symbol: input.symbol, position: input.position };
};

export const parsePagination = (query: Record<string, unknown>) => {
  const page = Math.max(1, Math.trunc(Number(query.page) || 1));
  const pageSize = Math.min(100, Math.max(1, Math.trunc(Number(query.pageSize) || 20)));
  return { page, pageSize, offset: (page - 1) * pageSize };
};
