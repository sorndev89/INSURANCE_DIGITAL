import type { Request } from 'express';
import { ApiError } from './errors.js';

export type ListQuery = {
  page: number;
  pageSize: number;
  offset: number;
  search: string;
  sortField: string | null;
  sortOrder: 'asc' | 'desc';
};

export const parseListQuery = (req: Request): ListQuery => {
  const page = Math.max(1, Math.trunc(Number(req.query.page) || 1));
  const pageSize = Math.min(100, Math.max(1, Math.trunc(Number(req.query.pageSize) || 20)));
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const rawSort = typeof req.query.sort === 'string' ? req.query.sort : '';
  const [field, order] = rawSort.split(':');

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
    search,
    sortField: field || null,
    sortOrder: order === 'asc' ? 'asc' : 'desc',
  };
};

export const likeValue = (value: string) => `%${value}%`;

export const toNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const toDateString = (value: unknown) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

export const sequenceNumber = (prefix: string, count: number, width = 4) =>
  `${prefix}${String(count + 1).padStart(width, '0')}`;

export const today = () => new Date().toISOString().slice(0, 10);

export const parsePositiveInt = (value: unknown, field: string) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw ApiError.badRequest(`${field} must be a positive integer`);
  }
  return parsed;
};
