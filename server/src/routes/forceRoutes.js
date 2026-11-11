import express from 'express';
import {
  getForceList,
  createForceMember,
  updateForceMember,
  deleteForceMember,
  replaceForceList
} from '../controllers/forceController.js';

const router = express.Router();

router.get('/', getForceList);
router.post('/replace', replaceForceList);
router.post('/', createForceMember);
router.put('/:id', updateForceMember);
router.delete('/:id', deleteForceMember);

export default router;
