import express from 'express';
import {
  getLeaves,
  createLeave,
  updateLeave,
  resumeDuty,
  deleteLeave
} from '../controllers/leaveController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getLeaves);
router.post('/', authenticateToken, createLeave);
router.put('/:id', authenticateToken, updateLeave);
router.post('/:id/resume', authenticateToken, resumeDuty);
router.delete('/:id', authenticateToken, requireAdmin, deleteLeave);

export default router;

