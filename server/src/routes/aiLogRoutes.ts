import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import * as aiLogController from '../controllers/aiLogController';

const router = Router();

router.use(authenticate);

router.get('/logs', aiLogController.getLogs);
router.get('/stats', aiLogController.getUsageStats);

export default router;
