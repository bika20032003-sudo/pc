import express from 'express';
import {
  getFuelState,
  addFuelShipment,
  dispenseFuel
} from '../controllers/fuelController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getFuelState);
router.post('/shipment', authenticateToken, addFuelShipment);
router.post('/dispense', authenticateToken, dispenseFuel);

export default router;
