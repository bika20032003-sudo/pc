import express from 'express';
import {
  getLeaves,
  createLeave,
  updateLeave,
  resumeDuty,
  deleteLeave
} from '../controllers/leaveController.js';

const router = express.Router();

router.get('/', getLeaves);
router.post('/', createLeave);
router.put('/:id', updateLeave);
router.post('/:id/resume', resumeDuty);
router.delete('/:id', deleteLeave);

export default router;
