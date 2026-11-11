import express from 'express';
import { getAttendance, recordAttendance, bulkRecordAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

router.get('/', getAttendance);
router.post('/', recordAttendance);
router.post('/bulk', bulkRecordAttendance);

export default router;
