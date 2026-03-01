import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d'; // Token valid for 7 days

export const authService = {

    // Register new user
    async register(userData) {
        const { email, password, first_name, last_name, role } = userData;

        // Validate email
        if (!email || email.trim().length === 0) {
            throw { status: 400, message: 'Email is required' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw { status: 400, message: 'Invalid email format' };
        }

        // Check if email already exists
        const existingUser = await userModel.findByEmail(email.trim().toLowerCase());
        if (existingUser) {
            throw { status: 400, message: 'Email already registered' };
        }

        // Validate password
        if (!password || password.length < 6) {
            throw { status: 400, message: 'Password must be at least 6 characters' };
        }

        // Validate names
        if (!first_name || first_name.trim().length === 0) {
            throw { status: 400, message: 'First name is required' };
        }

        if (!last_name || last_name.trim().length === 0) {
            throw { status: 400, message: 'Last name is required' };
        }

        // Validate role (if provided)
        const validRoles = ['user', 'manager', 'admin'];
        if (role && !validRoles.includes(role)) {
            throw { status: 400, message: 'Invalid role' };
        }

        // Hash password (NEVER store plain text!)
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await userModel.create({
            email: email.trim().toLowerCase(),
            password_hash,
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            role: role || 'user'
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return {
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            },
            token
        };
    },

    // Login existing user
    async login(email, password) {
        // Validate input
        if (!email || !password) {
            throw { status: 400, message: 'Email and password are required' };
        }

        // Find user
        const user = await userModel.findByEmail(email.trim().toLowerCase());
        if (!user) {
            throw { status: 401, message: 'Invalid email or password' };
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw { status: 401, message: 'Invalid email or password' };
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return {
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            },
            token
        };
    },

    // Verify JWT token (used by middleware)
    async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            // Optional: Check if user still exists
            const user = await userModel.findById(decoded.userId);
            if (!user) {
                throw { status: 401, message: 'User not found' };
            }

            return {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw { status: 401, message: 'Token expired' };
            }
            throw { status: 401, message: 'Invalid token' };
        }
    }
};