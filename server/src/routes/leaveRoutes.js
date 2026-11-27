import express from 'express';
import {
  getLeaves,
  createLeave,
  updateLeave,
  resumeDuty,
  deleteLeave
} from '../controllers/leaveController.js';
import { authenticateToken, requireAdmin, requireSectionAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, requireSectionAccess('leaves'), getLeaves);
router.post('/', authenticateToken, requireSectionAccess('leaves'), createLeave);
router.put('/:id', authenticateToken, requireSectionAccess('leaves'), updateLeave);
router.post('/:id/resume', authenticateToken, requireSectionAccess('leaves'), resumeDuty);
router.delete('/:id', authenticateToken, requireAdmin, deleteLeave);

export default router;

