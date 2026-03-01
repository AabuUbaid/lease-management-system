import express from 'express';
import { propertyController } from '../controllers/propertyController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes (anyone can view)
router.get('/', propertyController.getAll);
router.get('/:id', propertyController.getById);

// Protected routes (must be logged in + manager or admin role)
router.post('/', authenticateToken, requireRole('manager', 'admin'), propertyController.create);
router.put('/:id', authenticateToken, requireRole('manager', 'admin'), propertyController.update);
router.delete('/:id', authenticateToken, requireRole('manager', 'admin'), propertyController.delete);

export default router;