import { Router } from 'express';
import { login, register, getMe } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.get('/me', authenticate, getMe);

export default router;
