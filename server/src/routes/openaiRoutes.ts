import { Router } from 'express';
import { saveApiKey, getApiKeyStatus, deleteApiKey } from '../controllers/openaiController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/key', saveApiKey);
router.get('/status', getApiKeyStatus);
router.delete('/key', deleteApiKey);

export default router;
