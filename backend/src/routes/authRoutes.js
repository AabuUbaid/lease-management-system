import express from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected route (requires authentication)
router.get('/me', authenticateToken, authController.getCurrentUser);

export default router;