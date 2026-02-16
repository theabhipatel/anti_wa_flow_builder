import { Router } from 'express';
import {
    createFlow,
    getFlows,
    getFlow,
    updateFlow,
    deleteFlow,
    saveDraft,
    validateFlowEndpoint,
    deployFlow,
    rollbackFlow,
    getFlowVersions,
    duplicateFlow,
} from '../controllers/flowController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/:botId/flows', createFlow);
router.get('/:botId/flows', getFlows);
router.get('/:botId/flows/:flowId', getFlow);
router.put('/:botId/flows/:flowId', updateFlow);
router.delete('/:botId/flows/:flowId', deleteFlow);

// Flow versions
router.put('/:botId/flows/:flowId/draft', saveDraft);
router.post('/:botId/flows/:flowId/validate', validateFlowEndpoint);
router.post('/:botId/flows/:flowId/deploy', deployFlow);
router.post('/:botId/flows/:flowId/rollback', rollbackFlow);
router.get('/:botId/flows/:flowId/versions', getFlowVersions);
router.post('/:botId/flows/:flowId/duplicate', duplicateFlow);

export default router;
