import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { login, me, register } from '../controllers/auth.js';

const router = Router();

router.post(
  '/register',
  rateLimit({ scope: 'auth-register', windowMs: 15 * 60_000, max: 30 }),
  register,
);
router.post('/login', rateLimit({ scope: 'auth-login', windowMs: 15 * 60_000, max: 100 }), login);
router.get('/me', authMiddleware, me);

export default router;
