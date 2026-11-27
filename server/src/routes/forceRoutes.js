import express from 'express';
import {
  getForceList,
  getForceMemberById,
  createForceMember,
  updateForceMember,
  deleteForceMember,
  replaceForceList,
  selfInquiryForceMember,
  selfUpdateForceMember
} from '../controllers/forceController.js';
import { authenticateToken, requireAdmin, requireSectionAccess } from '../middleware/authMiddleware.js';
import { selfInquiryLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getForceList);
router.post('/replace', authenticateToken, requireAdmin, replaceForceList);
router.post('/self-inquiry', selfInquiryLimiter, selfInquiryForceMember);
router.post('/self-update', selfInquiryLimiter, selfUpdateForceMember);
router.get('/:id', authenticateToken, getForceMemberById);
router.post('/', authenticateToken, requireSectionAccess('force'), createForceMember);
router.put('/:id', authenticateToken, requireSectionAccess('force'), updateForceMember);
router.delete('/:id', authenticateToken, requireAdmin, deleteForceMember);

export default router;
