import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './src/config/init-db.js';

// Import routes
import propertyRoutes from './src/routes/propertyRoutes.js';
import unitRoutes from './src/routes/unitRoutes.js';
import tenantRoutes from './src/routes/tenantRoutes.js';
import leaseRoutes from './src/routes/leaseRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

// Load environment variables
dotenv.config();

// Initialize database on startup
initializeDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Lease Management API is running',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/properties', propertyRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/leases', leaseRoutes);
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});