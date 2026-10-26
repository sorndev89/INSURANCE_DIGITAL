import type { Request, Response } from 'express';
import { eq, or } from 'drizzle-orm';
import { db } from '../db/index.js';
import { platformUsers } from '../db/schema.js';
import { comparePassword, generatePlatformToken } from '../utils/auth.js';
import { ApiError } from '../utils/errors.js';
import { asObject, requirePassword, requireString } from '../utils/validate.js';
import { writeAuditLog } from '../services/audit.js';

export const login = async (req: Request, res: Response) => {
  const body = asObject(req.body);
  const identifier = requireString(
    body.identifier ?? body.email ?? body.username,
    'identifier',
    { max: 255 },
  ).toLowerCase();
  const password = requirePassword(body.password);

  const user = await db.query.platformUsers.findFirst({
    where: or(
      eq(platformUsers.email, identifier),
      eq(platformUsers.username, identifier),
    ),
  });

  if (!user || !(await comparePassword(password, user.password))) {
    throw new ApiError(401, 'invalid_credentials', 'Invalid email/username or password');
  }
  if (user.status !== 'active') {
    throw ApiError.forbidden('This platform account is disabled');
  }

  await db
    .update(platformUsers)
    .set({ lastLoginAt: new Date() })
    .where(eq(platformUsers.id, user.id));

  const token = generatePlatformToken(user);

  await writeAuditLog({
    actorId: user.id,
    action: 'platform.login',
    target: user.email,
    ip: req.ip,
  });

  res.json({
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
      },
    },
  });
};

export const me = async (req: Request, res: Response) => {
  if (!req.platformAuth) throw ApiError.unauthorized();
  const user = await db.query.platformUsers.findFirst({
    where: eq(platformUsers.id, req.platformAuth.platformUserId),
  });
  if (!user || user.status !== 'active') {
    throw ApiError.unauthorized('Platform account no longer exists');
  }
  res.json({
    data: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      mfaEnabled: user.mfaEnabled,
      lastLoginAt: user.lastLoginAt,
    },
  });
};
