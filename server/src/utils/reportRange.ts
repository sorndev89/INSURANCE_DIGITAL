import { ApiError } from './errors.js';

export type ReportRange = { from: string; to: string };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const pad = (value: number) => String(value).padStart(2, '0');

export const formatDate = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

export const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
};

export const addDays = (value: string, days: number) => {
  const date = parseDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDate(date);
};

export const startOfMonth = (value: string) => {
  const date = parseDate(value);
  return formatDate(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 12)));
};

export const endOfMonth = (value: string) => {
  const date = parseDate(value);
  return formatDate(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 12)));
};

export const todayInTimezone = (timeZone = 'Asia/Vientiane') => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value || '';
  return `${value('year')}-${value('month')}-${value('day')}`;
};

const isValidDate = (value: string) => {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = parseDate(value);
  return formatDate(parsed) === value;
};

const queryValue = (value: unknown) => {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return queryValue(value[0]);
  if (value && typeof value === 'object') return queryValue((value as Record<string, unknown>)[0]);
  return '';
};

export const resolveReportRange = (query: Record<string, unknown>): ReportRange => {
  const today = todayInTimezone();
  const rawTo = queryValue(query.to);
  const rawFrom = queryValue(query.from);

  if (rawTo && !isValidDate(rawTo)) {
    throw ApiError.badRequest('to must be a valid date in YYYY-MM-DD format');
  }
  if (rawFrom && !isValidDate(rawFrom)) {
    throw ApiError.badRequest('from must be a valid date in YYYY-MM-DD format');
  }

  const to = rawTo || today;
  const defaultFromDate = parseDate(to);
  const defaultFrom = formatDate(
    new Date(Date.UTC(defaultFromDate.getUTCFullYear(), defaultFromDate.getUTCMonth() - 11, 1, 12)),
  );
  const from = rawFrom || defaultFrom;

  if (from > to) {
    throw ApiError.badRequest('from must be before or equal to to');
  }

  return { from, to };
};

export const previousRange = ({ from, to }: ReportRange): ReportRange => {
  const days = Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000) + 1;
  const previousTo = addDays(from, -1);
  const previousFrom = addDays(previousTo, -(days - 1));
  return { from: previousFrom, to: previousTo };
};

export const trailingMonths = (to: string, count = 12) => {
  const end = parseDate(to);
  const from = formatDate(
    new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - (count - 1), 1, 12)),
  );
  return { from, to: endOfMonth(to) };
};

export const monthKeys = ({ from, to }: ReportRange) => {
  const start = parseDate(from);
  const end = parseDate(to);
  const keys: string[] = [];
  let year = start.getUTCFullYear();
  let month = start.getUTCMonth();
  const lastYear = end.getUTCFullYear();
  const lastMonth = end.getUTCMonth();

  while (year < lastYear || (year === lastYear && month <= lastMonth)) {
    keys.push(`${year}-${pad(month + 1)}`);
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  return keys;
};

export const monthLabel = (key: string) => {
  const [year, month] = key.split('-');
  return `${month}/${year}`;
};
