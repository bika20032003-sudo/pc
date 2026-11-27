import express from 'express';
import {
  getMail,
  getMailById,
  createMail,
  updateMail,
  deleteMail,
  getMailStats
} from '../controllers/mailController.js';
import { authenticateToken, requireAdmin, requireSectionAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authenticateToken, requireSectionAccess('mail', 'referred', 'letters'), getMailStats);
router.get('/', authenticateToken, requireSectionAccess('mail', 'referred', 'letters'), getMail);
router.get('/:id', authenticateToken, requireSectionAccess('mail', 'referred', 'letters'), getMailById);
router.post('/', authenticateToken, requireSectionAccess('mail', 'referred', 'letters'), createMail);
router.put('/:id', authenticateToken, requireSectionAccess('mail', 'referred', 'letters'), updateMail);
router.delete('/:id', authenticateToken, requireAdmin, deleteMail);

export default router;
