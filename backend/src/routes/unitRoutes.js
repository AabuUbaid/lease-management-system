import express from 'express';
import { unitController } from '../controllers/unitController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', unitController.getAll);
router.get('/:id', unitController.getById);

// Protected routes
router.post('/', authenticateToken, requireRole('manager', 'admin'), unitController.create);
router.put('/:id', authenticateToken, requireRole('manager', 'admin'), unitController.update);
router.delete('/:id', authenticateToken, requireRole('manager', 'admin'), unitController.delete);

export default router;