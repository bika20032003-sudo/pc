import express from 'express';
import { getPenalties, createPenalty, deletePenalty, toggleApplied } from '../controllers/penaltiesController.js';
import { authenticateToken, requireAdmin, requireSectionAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all penalties (authenticated)
router.get('/', authenticateToken, requireSectionAccess('penalties'), getPenalties);

// POST create penalty (authenticated)
router.post('/', authenticateToken, requireSectionAccess('penalties'), createPenalty);

// DELETE penalty (authenticated admin)
router.delete('/:id', authenticateToken, requireAdmin, deletePenalty);

// POST toggle penalty applied status (authenticated)
router.post('/:id/toggle-applied', authenticateToken, requireSectionAccess('penalties'), toggleApplied);

export default router;
