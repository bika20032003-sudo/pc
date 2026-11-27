import express from 'express';
import {
  getWeapons,
  getWeaponById,
  createWeapon,
  updateWeapon,
  deleteWeapon,
  importWeapons
} from '../controllers/weaponsController.js';
import { authenticateToken, requireAdmin, requireSectionAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, requireSectionAccess('weapons'), getWeapons);
router.get('/:id', authenticateToken, requireSectionAccess('weapons'), getWeaponById);
router.post('/', authenticateToken, requireSectionAccess('weapons'), createWeapon);
router.put('/:id', authenticateToken, requireSectionAccess('weapons'), updateWeapon);
router.delete('/:id', authenticateToken, requireAdmin, deleteWeapon);
router.post('/import', authenticateToken, requireAdmin, importWeapons);

export default router;
