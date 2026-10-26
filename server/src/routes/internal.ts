import { Router } from 'express';
import { env } from '../config/env.js';
import { isDomainAllowedForTls } from '../services/domains.js';

const router = Router();

router.get('/tls/allow', async (req, res) => {
  if (env.tlsAskToken) {
    const provided = req.header('x-tls-ask-token') || String(req.query.token ?? '');
    if (provided !== env.tlsAskToken) {
      res.status(403).end();
      return;
    }
  }

  const domain = typeof req.query.domain === 'string' ? req.query.domain : '';
  const allowed = domain ? await isDomainAllowedForTls(domain) : false;
  res.status(allowed ? 200 : 404).end();
});

export default router;
