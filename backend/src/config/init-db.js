import { query } from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
    try {
        // Check if tables exist
        const checkTables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'properties'
    `);

        if (checkTables.rows.length === 0) {
            console.log('📊 Initializing database schema...');

            // Read and execute schema files
            const schemaPath = path.join(__dirname, 'schema.sql');
            const authSchemaPath = path.join(__dirname, 'auth_schema.sql');

            const schema = fs.readFileSync(schemaPath, 'utf8');
            const authSchema = fs.readFileSync(authSchemaPath, 'utf8');

            // Execute schema
            await query(schema);
            await query(authSchema);

            console.log('✅ Database schema initialized successfully');
        } else {
            console.log('✅ Database already initialized');
        }
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
}