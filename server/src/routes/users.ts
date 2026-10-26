import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { enforcePlanLimit } from '../middleware/limits.js';
import { create, list, stats, update } from '../controllers/users.js';

const router = Router();

router.use(authMiddleware, requireRole('admin'));
router.get('/', list);
router.get('/stats', stats);
router.post('/', enforcePlanLimit('maxUsers'), create);
router.patch('/:id', update);

export default router;
