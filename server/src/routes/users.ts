import { Router } from 'express';
import { authMiddleware, requirePermission } from '../middleware/auth.js';
import { enforcePlanLimit } from '../middleware/limits.js';
import { create, list, remove, stats, update } from '../controllers/users.js';

const router = Router();

router.use(authMiddleware, requirePermission('user.view'));
router.get('/', list);
router.get('/stats', stats);
router.post('/', requirePermission('user.manage'), enforcePlanLimit('maxUsers'), create);
router.patch('/:id', requirePermission('user.manage'), update);
router.delete('/:id', requirePermission('user.manage'), remove);

export default router;
