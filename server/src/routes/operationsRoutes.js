import express from 'express';
import {
  getOperationsLocations,
  createOperationsLocation,
  updateOperationsLocation,
  deleteOperationsLocation,
  addOperationsLog,
  getDashboardLiveStats
} from '../controllers/operationsController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getOperationsLocations);
router.post('/', authenticateToken, createOperationsLocation);
router.post('/logs', authenticateToken, addOperationsLog);
router.put('/:id', authenticateToken, updateOperationsLocation);
router.delete('/:id', authenticateToken, requireAdmin, deleteOperationsLocation);
router.get('/dashboard-stats', authenticateToken, getDashboardLiveStats);

export default router;
