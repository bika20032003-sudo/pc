import express from 'express';
import {
  getMail,
  getMailById,
  createMail,
  updateMail,
  deleteMail,
  getMailStats
} from '../controllers/mailController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authenticateToken, getMailStats);
router.get('/', authenticateToken, getMail);
router.get('/:id', authenticateToken, getMailById);
router.post('/', authenticateToken, createMail);
router.put('/:id', authenticateToken, updateMail);
router.delete('/:id', authenticateToken, requireAdmin, deleteMail);

export default router;
