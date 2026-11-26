import express from 'express';
import {
  getWeapons,
  getWeaponById,
  createWeapon,
  updateWeapon,
  deleteWeapon,
  importWeapons
} from '../controllers/weaponsController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getWeapons);
router.get('/:id', authenticateToken, getWeaponById);
router.post('/', authenticateToken, createWeapon);
router.put('/:id', authenticateToken, updateWeapon);
router.delete('/:id', authenticateToken, requireAdmin, deleteWeapon);
router.post('/import', authenticateToken, requireAdmin, importWeapons);

export default router;
