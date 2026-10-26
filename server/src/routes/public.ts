import { Router } from 'express';
import { config, plans, tenant } from '../controllers/public.js';

const router = Router();

router.get('/config', config);
router.get('/tenant', tenant);
router.get('/plans', plans);

export default router;
