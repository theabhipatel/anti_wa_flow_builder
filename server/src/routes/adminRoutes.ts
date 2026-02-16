import { Router } from 'express';
import { getAllUsers, getAllBots } from '../controllers/adminController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/users', getAllUsers);
router.get('/bots', getAllBots);

export default router;
