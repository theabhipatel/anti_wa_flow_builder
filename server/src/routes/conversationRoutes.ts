import { Router } from 'express';
import {
    getConversations,
    getMessages,
    sendManualMessage,
} from '../controllers/conversationController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/:botId', getConversations);
router.get('/:botId/:phoneNumber/messages', getMessages);
router.post('/:botId/:phoneNumber/send', sendManualMessage);

export default router;
