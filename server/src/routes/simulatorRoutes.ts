import { Router } from 'express';
import { sendSimulatorMessage, resetSimulatorSession, getSimulatorLogs, pollSimulatorMessages } from '../controllers/simulatorController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/message', sendSimulatorMessage);
router.post('/reset', resetSimulatorSession);
router.get('/logs/:sessionId', getSimulatorLogs);
router.get('/poll', pollSimulatorMessages);

export default router;
