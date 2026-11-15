import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateProfile
} from '../controllers/userController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getAllUsers);
router.post('/', optionalAuth, createUser);
router.put('/profile', optionalAuth, updateProfile);
router.put('/:id', optionalAuth, updateUser);
router.delete('/:id', optionalAuth, deleteUser);

export default router;
