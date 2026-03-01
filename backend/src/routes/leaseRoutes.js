import express from 'express';
import { leaseController } from '../controllers/leaseController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public/User routes (anyone logged in can view)
router.get('/', authenticateToken, leaseController.getAll);
router.get('/active', authenticateToken, leaseController.getActive);
router.get('/expiring', authenticateToken, leaseController.getExpiring);
router.get('/vacant-units', authenticateToken, leaseController.getVacantUnits);
router.get('/:id', authenticateToken, leaseController.getById);

// Protected routes (only managers and admins can create/edit)
router.post('/', authenticateToken, requireRole('manager', 'admin'), leaseController.create);
router.put('/:id', authenticateToken, requireRole('manager', 'admin'), leaseController.update);
router.delete('/:id', authenticateToken, requireRole('manager', 'admin'), leaseController.delete);

export default router;