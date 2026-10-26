import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tenants } from '../db/schema.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/errors.js';
import { invalidateTenantCache } from '../services/tenantCache.js';
import { seedTenantDemoData } from '../services/tenantData.js';

export const seedDemoData = async () => {
  if (env.isProduction) {
    console.log('[demo] skipped in production');
    return;
  }

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, env.defaultTenantSlug))
    .limit(1);
  if (!tenant) throw new Error(`Default tenant "${env.defaultTenantSlug}" not found`);

  try {
    const counts = await seedTenantDemoData(tenant.id);

    await invalidateTenantCache();
    console.log(
      `[demo] seeded tenant ${tenant.slug}: ${counts.policies} policies, ${counts.customers} customers`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      console.log('[demo] tenant already has business data, skipping');
      return;
    }
    throw error;
  }
};
