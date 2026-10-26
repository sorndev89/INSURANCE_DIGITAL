import { eq, or } from 'drizzle-orm';
import { env } from '../config/env.js';
import { db } from '../db/index.js';
import { platformUsers } from '../db/schema.js';
import { comparePassword, hashPassword } from '../utils/auth.js';

const MIN_PASSWORD_LENGTH = 8;

export const bootstrapPlatformAdmin = async () => {
  if (!env.platformAdminAutoSeed) return;

  if (!env.platformAdminPassword) {
    console.log(
      '[bootstrap] PLATFORM_ADMIN_PASSWORD is not set; skipping platform admin bootstrap',
    );
    return;
  }

  if (env.platformAdminPassword.length < MIN_PASSWORD_LENGTH) {
    console.warn(
      `[bootstrap] PLATFORM_ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters; skipping platform admin bootstrap`,
    );
    return;
  }

  const username = env.platformAdminUsername.trim().toLowerCase();
  const email = env.platformAdminEmail.trim().toLowerCase();

  const [existing] = await db
    .select({
      id: platformUsers.id,
      username: platformUsers.username,
      email: platformUsers.email,
      password: platformUsers.password,
      role: platformUsers.role,
      status: platformUsers.status,
    })
    .from(platformUsers)
    .where(or(eq(platformUsers.email, email), eq(platformUsers.username, username)))
    .limit(1);

  if (!existing) {
    await db.insert(platformUsers).values({
      name: 'Platform Admin',
      username,
      email,
      password: await hashPassword(env.platformAdminPassword),
      role: 'superadmin',
      status: 'active',
    });
    console.log(`[bootstrap] created platform admin: ${username} <${email}>`);
    return;
  }

  const passwordMatches = await comparePassword(env.platformAdminPassword, existing.password);
  const needsUpdate =
    existing.username !== username ||
    existing.email !== email ||
    existing.role !== 'superadmin' ||
    existing.status !== 'active' ||
    !passwordMatches;

  if (!needsUpdate) {
    console.log(`[bootstrap] platform admin ready: ${username}`);
    return;
  }

  await db
    .update(platformUsers)
    .set({
      username,
      email,
      role: 'superadmin',
      status: 'active',
      ...(passwordMatches ? {} : { password: await hashPassword(env.platformAdminPassword) }),
    })
    .where(eq(platformUsers.id, existing.id));

  console.log(`[bootstrap] updated platform admin: ${username} <${email}>`);
};
