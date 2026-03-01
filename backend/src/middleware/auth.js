import { authService } from '../services/authService.js';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        // Verify token
        const user = await authService.verifyToken(token);

        // Attach user info to request object
        req.user = user;

        // Continue to next middleware/controller
        next();
    } catch (error) {
        res.status(401).json({ error: error.message || 'Invalid token' });
    }
};

// Middleware to check if user has required role
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                required: allowedRoles,
                current: req.user.role
            });
        }

        next();
    };
};
