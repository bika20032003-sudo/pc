import express from 'express';
import { getAttendance, recordAttendance, bulkRecordAttendance } from '../controllers/attendanceController.js';
import { authenticateToken, requireSectionAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, requireSectionAccess('force', 'operations', 'dashboard'), getAttendance);
router.post('/', authenticateToken, requireSectionAccess('force', 'operations'), recordAttendance);
router.post('/bulk', authenticateToken, requireSectionAccess('force', 'operations'), bulkRecordAttendance);

export default router;

