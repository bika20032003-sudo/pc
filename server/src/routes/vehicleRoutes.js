import express from 'express';
import {
  getVehicleList,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  replaceVehicleList
} from '../controllers/vehicleController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getVehicleList);
router.post('/replace', authenticateToken, requireAdmin, replaceVehicleList);
router.post('/', authenticateToken, createVehicle);
router.put('/:id', authenticateToken, updateVehicle);
router.delete('/:id', authenticateToken, requireAdmin, deleteVehicle);

export default router;

