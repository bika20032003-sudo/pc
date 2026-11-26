import express from 'express';
import { getAttendance, recordAttendance, bulkRecordAttendance } from '../controllers/attendanceController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getAttendance);
router.post('/', authenticateToken, recordAttendance);
router.post('/bulk', authenticateToken, bulkRecordAttendance);

export default router;

