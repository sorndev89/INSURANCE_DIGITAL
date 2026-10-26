import { Router } from 'express';
import { plans, tenant } from '../controllers/public.js';

const router = Router();

router.get('/tenant', tenant);
router.get('/plans', plans);

export default router;
