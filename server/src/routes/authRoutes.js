import { Router } from 'express';
import { login, getProfile, getSystemStatus } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { loginLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

router.post('/login', loginLimiter, login);
router.get('/me', authenticateToken, getProfile);
router.get('/status', getSystemStatus);

export default router;
