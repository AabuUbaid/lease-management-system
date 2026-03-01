import { query } from '../config/database.js';

export const userModel = {

    // Find user by email (for login)
    async findByEmail(email) {
        const sql = `
      SELECT id, email, password_hash, first_name, last_name, role, created_at
      FROM users
      WHERE email = $1
    `;
        const result = await query(sql, [email]);
        return result.rows[0];
    },

    // Find user by ID (for token verification)
    async findById(id) {
        const sql = `
      SELECT id, email, first_name, last_name, role, created_at
      FROM users
      WHERE id = $1
    `;
        const result = await query(sql, [id]);
        return result.rows[0];
    },

    // Create new user
    async create(userData) {
        const { email, password_hash, first_name, last_name, role } = userData;
        const sql = `
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, role, created_at
    `;
        const result = await query(sql, [email, password_hash, first_name, last_name, role || 'user']);
        return result.rows[0];
    },

    // Get all users (for admin)
    async findAll() {
        const sql = `
      SELECT id, email, first_name, last_name, role, created_at
      FROM users
      ORDER BY created_at DESC
    `;
        const result = await query(sql);
        return result.rows;
    }
};