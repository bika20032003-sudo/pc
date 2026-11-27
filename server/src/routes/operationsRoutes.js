import express from 'express';
import {
  getOperationsLocations,
  createOperationsLocation,
  updateOperationsLocation,
  deleteOperationsLocation,
  addOperationsLog
} from '../controllers/operationsController.js';
import { authenticateToken, requireAdmin, requireSectionAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, requireSectionAccess('operations'), getOperationsLocations);
router.post('/', authenticateToken, requireSectionAccess('operations'), createOperationsLocation);
router.post('/logs', authenticateToken, requireSectionAccess('operations'), addOperationsLog);
router.put('/:id', authenticateToken, requireSectionAccess('operations'), updateOperationsLocation);
router.delete('/:id', authenticateToken, requireAdmin, deleteOperationsLocation);

export default router;
