import express from 'express';
import { getPenalties, createPenalty, deletePenalty, toggleApplied } from '../controllers/penaltiesController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all penalties (public/authenticated read)
router.get('/', getPenalties);

// POST create penalty (authenticated)
router.post('/', authenticateToken, createPenalty);

// DELETE penalty (authenticated admin)
router.delete('/:id', authenticateToken, requireAdmin, deletePenalty);

// POST toggle penalty applied status (authenticated)
router.post('/:id/toggle-applied', authenticateToken, toggleApplied);

export default router;
