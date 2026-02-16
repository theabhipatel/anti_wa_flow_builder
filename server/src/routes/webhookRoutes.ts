import { Router } from 'express';
import { verifyWebhook, handleWebhook } from '../controllers/webhookController';
import { webhookLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.get('/whatsapp', verifyWebhook);
router.post('/whatsapp', webhookLimiter, handleWebhook);

export default router;
