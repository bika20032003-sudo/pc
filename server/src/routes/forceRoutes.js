import express from 'express';
import {
  getForceList,
  createForceMember,
  updateForceMember,
  deleteForceMember,
  replaceForceList,
  selfUpdateForceMember
} from '../controllers/forceController.js';

const router = express.Router();

router.get('/', getForceList);
router.post('/replace', replaceForceList);
router.post('/self-update', selfUpdateForceMember);
router.post('/', createForceMember);
router.put('/:id', updateForceMember);
router.delete('/:id', deleteForceMember);

export default router;
