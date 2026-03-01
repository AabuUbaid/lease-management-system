import { query } from "./src/config/database.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import propertyRoutes from './src/routes/propertyRoutes.js';
import unitRoutes from "./src/routes/unitRoutes.js";
import tenantRoutes from "./src/routes/tenantRoutes.js"
import leaseRoutes from './src/routes/leaseRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// ROUTES

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Lease Management API is running',
        timestamp: new Date().toISOString()
    });
});

// Database connection test
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await query('SELECT NOW() as current_time');
        res.json({
            status: 'connected',
            database_time: result.rows[0].current_time
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Property routes
app.use('/api/properties', propertyRoutes);

// Unit routes
app.use('/api/units', unitRoutes);

// Tenant routes
app.use('/api/tenants', tenantRoutes);

// Lease routes
app.use('/api/leases', leaseRoutes);

// Auth routes 
app.use('/api/auth', authRoutes);


//ERROR HANDLING
app.use((req, res) => {
    res.status(404).json({
        error: 'Route Not Found',
        path: req.path
    });
});


// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});