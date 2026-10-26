import { randomBytes } from 'node:crypto';
import { resolveTxt } from 'node:dns/promises';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tenantDomains, tenants } from '../db/schema.js';
import { env } from '../config/env.js';

export const VERIFY_PREFIX = '_saiyfon-verify';

export const normalizeHostname = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '')
    .replace(/\.$/, '');

export const createVerificationToken = () => randomBytes(16).toString('hex');

export const verificationRecordName = (hostname: string) =>
  `${VERIFY_PREFIX}.${normalizeHostname(hostname)}`;

export const verificationRecordValue = (token: string) => `saiyfon-verify=${token}`;

export const verifyDomainOwnership = async (
  hostname: string,
  token: string,
  { force = false }: { force?: boolean } = {},
) => {
  if (force) return true;

  try {
    const records = await resolveTxt(verificationRecordName(hostname));
    const values = records.map((chunks) => chunks.join('').trim());
    const expected = verificationRecordValue(token);
    return values.includes(expected) || values.includes(token);
  } catch {
    return false;
  }
};

export const domainDnsInstructions = (hostname: string, token: string) => ({
  hostname,
  cname: { type: 'CNAME', name: hostname, value: env.cnameTarget },
  verification: {
    type: 'TXT',
    name: verificationRecordName(hostname),
    value: verificationRecordValue(token),
  },
});

export const isDomainAllowedForTls = async (hostname: string) => {
  const host = normalizeHostname(hostname);
  if (!host) return false;
  if (host === env.rootDomain || host.endsWith(`.${env.rootDomain}`)) return true;

  const rows = await db
    .select({ id: tenantDomains.id })
    .from(tenantDomains)
    .innerJoin(tenants, eq(tenants.id, tenantDomains.tenantId))
    .where(
      and(
        eq(tenantDomains.hostname, host),
        isNotNull(tenantDomains.verifiedAt),
        isNull(tenants.deletedAt),
      ),
    )
    .limit(1);

  return rows.length > 0;
};
