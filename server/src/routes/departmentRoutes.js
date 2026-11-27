import express from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/departmentController.js';
import { authenticateToken, requireAdmin, requireSectionAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getDepartments);
router.post('/', authenticateToken, requireSectionAccess('departments'), createDepartment);
router.put('/:id', authenticateToken, requireSectionAccess('departments'), updateDepartment);
router.delete('/:id', authenticateToken, requireAdmin, deleteDepartment);

export default router;
