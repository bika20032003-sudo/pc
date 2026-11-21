import express from 'express';
import {
  getWeapons,
  getWeaponById,
  createWeapon,
  updateWeapon,
  deleteWeapon,
  importWeapons
} from '../controllers/weaponsController.js';

const router = express.Router();

router.get('/', getWeapons);
router.get('/:id', getWeaponById);
router.post('/', createWeapon);
router.put('/:id', updateWeapon);
router.delete('/:id', deleteWeapon);
router.post('/import', importWeapons);

export default router;
