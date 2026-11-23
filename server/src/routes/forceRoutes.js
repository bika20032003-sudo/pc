import express from 'express';
import {
  getForceList,
  createForceMember,
  updateForceMember,
  deleteForceMember,
  replaceForceList,
  selfUpdateForceMember
} from '../controllers/forceController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getForceList);
router.post('/replace', authenticateToken, requireAdmin, replaceForceList);
router.post('/self-update', selfUpdateForceMember);
router.post('/', authenticateToken, createForceMember);
router.put('/:id', authenticateToken, updateForceMember);
router.delete('/:id', authenticateToken, requireAdmin, deleteForceMember);

export default router;
