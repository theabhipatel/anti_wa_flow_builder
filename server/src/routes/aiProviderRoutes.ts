import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import * as aiProviderController from '../controllers/aiProviderController';

const router = Router();

router.use(authenticate);

router.post('/', aiProviderController.createProvider);
router.get('/', aiProviderController.listProviders);
router.put('/:id', aiProviderController.updateProvider);
router.delete('/:id', aiProviderController.deleteProvider);
router.post('/:id/test', aiProviderController.testProvider);

export default router;
