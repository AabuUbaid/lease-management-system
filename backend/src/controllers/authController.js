import { authService } from '../services/authService.js';

export const authController = {

    // POST /api/auth/register - Register new user
    async register(req, res, next) {
        try {
            const result = await authService.register(req.body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    },

    // POST /api/auth/login - Login user
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    // GET /api/auth/me - Get current user info (requires authentication)
    async getCurrentUser(req, res, next) {
        try {
            // req.user is set by auth middleware
            res.json({ user: req.user });
        } catch (error) {
            next(error);
        }
    }
};