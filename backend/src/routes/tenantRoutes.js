import express from 'express';
import { tenantController } from '../controllers/tenantController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', tenantController.getAll);
router.get('/:id', tenantController.getById);

// Protected routes
router.post('/', authenticateToken, requireRole('manager', 'admin'), tenantController.create);
router.put('/:id', authenticateToken, requireRole('manager', 'admin'), tenantController.update);
router.delete('/:id', authenticateToken, requireRole('manager', 'admin'), tenantController.delete);

export default router;