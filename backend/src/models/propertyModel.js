import { query } from '../config/database.js';

export const propertyModel = {

    // Get all properties
    async findAll() {
        const sql = `
      SELECT 
        id, name, address, city, state, zip_code, created_at
      FROM properties
      ORDER BY created_at DESC
    `;
        const result = await query(sql);
        return result.rows;
    },

    // Get single property by ID
    async findById(id) {
        const sql = `
      SELECT 
        id, name, address, city, state, zip_code, created_at
      FROM properties
      WHERE id = $1
    `;
        const result = await query(sql, [id]);
        return result.rows[0]; // Returns undefined if not found
    },

    // Create new property
    async create(propertyData) {
        const { name, address, city, state, zip_code } = propertyData;
        const sql = `
      INSERT INTO properties (name, address, city, state, zip_code)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const result = await query(sql, [name, address, city, state, zip_code]);
        return result.rows[0];
    },

    // Update property
    async update(id, propertyData) {
        const { name, address, city, state, zip_code } = propertyData;
        const sql = `
      UPDATE properties
      SET name = $1, address = $2, city = $3, state = $4, zip_code = $5
      WHERE id = $6
      RETURNING *
    `;
        const result = await query(sql, [name, address, city, state, zip_code, id]);
        return result.rows[0];
    },

    // Delete property
    async delete(id) {
        const sql = `DELETE FROM properties WHERE id = $1 RETURNING *`;
        const result = await query(sql, [id]);
        return result.rows[0];
    }
};