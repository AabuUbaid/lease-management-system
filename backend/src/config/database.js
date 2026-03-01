import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 3000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('Database connected');
});

pool.on('error', (err) => {
    console.error('Unexpected database error', err);
    process.exit(-1);
});

// Query helper function
export const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

export default pool;
