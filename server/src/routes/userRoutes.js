import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateProfile
} from '../controllers/userController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, getAllUsers);
router.post('/', authenticateToken, requireAdmin, createUser);
router.put('/profile', authenticateToken, updateProfile);
router.put('/:id', authenticateToken, requireAdmin, updateUser);
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);

export default router;
