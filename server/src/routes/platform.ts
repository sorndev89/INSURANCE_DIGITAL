import { Router } from 'express';
import { platformAuthMiddleware, requirePlatformRole } from '../middleware/platformAuth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { login, me } from '../controllers/platformAuth.js';
import * as tenants from '../controllers/tenants.js';
import * as plans from '../controllers/plans.js';
import * as audit from '../controllers/audit.js';
import { getPlatformDashboard } from '../controllers/platformDashboard.js';

const router = Router();

router.post(
  '/auth/login',
  rateLimit({ scope: 'platform-login', windowMs: 15 * 60_000, max: 30 }),
  login,
);

router.use(platformAuthMiddleware);

router.get('/dashboard', getPlatformDashboard);
router.get('/auth/me', me);
router.get('/audit-logs', audit.list);
router.get('/plans', plans.list);
router.post('/plans', requirePlatformRole('superadmin'), plans.create);
router.patch('/plans/:id', requirePlatformRole('superadmin'), plans.update);

router.get('/tenants', tenants.list);
router.post('/tenants', requirePlatformRole('superadmin'), tenants.create);
router.get('/tenants/:id', tenants.get);
router.patch('/tenants/:id', requirePlatformRole('superadmin'), tenants.update);
router.delete('/tenants/:id', requirePlatformRole('superadmin'), tenants.remove);
router.post('/tenants/:id/suspend', requirePlatformRole('superadmin'), tenants.setStatus('suspended'));
router.post('/tenants/:id/activate', requirePlatformRole('superadmin'), tenants.setStatus('active'));
router.post('/tenants/:id/domains', requirePlatformRole('superadmin'), tenants.addDomain);
router.post(
  '/tenants/:id/domains/:domainId/verify',
  requirePlatformRole('superadmin'),
  tenants.verifyDomain,
);
router.delete(
  '/tenants/:id/domains/:domainId',
  requirePlatformRole('superadmin'),
  tenants.removeDomain,
);
router.post('/tenants/:id/impersonate', requirePlatformRole('superadmin', 'support'), tenants.impersonate);
router.post('/tenants/:id/demo-data', requirePlatformRole('superadmin'), tenants.seedDemoData);
router.post('/tenants/:id/reset-data', requirePlatformRole('superadmin'), tenants.resetData);
router.get('/tenants/:id/usage', tenants.usage);
router.get('/tenants/:id/users', tenants.listUsers);

export default router;
