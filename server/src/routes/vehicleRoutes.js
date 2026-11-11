import express from 'express';
import {
  getVehicleList,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  replaceVehicleList
} from '../controllers/vehicleController.js';

const router = express.Router();

router.get('/', getVehicleList);
router.post('/replace', replaceVehicleList);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;

