import express from 'express';
import {
  getMail,
  getMailById,
  createMail,
  updateMail,
  deleteMail,
  getMailStats
} from '../controllers/mailController.js';

const router = express.Router();

router.get('/stats', getMailStats);
router.get('/', getMail);
router.get('/:id', getMailById);
router.post('/', createMail);
router.put('/:id', updateMail);
router.delete('/:id', deleteMail);

export default router;
