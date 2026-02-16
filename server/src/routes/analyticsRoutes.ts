import { Router } from 'express';
import { getDashboardStats } from '../controllers/analyticsController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);

export default router;
