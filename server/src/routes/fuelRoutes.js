import express from 'express';
import {
  getFuelState,
  addFuelShipment,
  dispenseFuel
} from '../controllers/fuelController.js';
import { authenticateToken, requireSectionAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, requireSectionAccess('fuel'), getFuelState);
router.post('/shipment', authenticateToken, requireSectionAccess('fuel'), addFuelShipment);
router.post('/dispense', authenticateToken, requireSectionAccess('fuel'), dispenseFuel);

export default router;
