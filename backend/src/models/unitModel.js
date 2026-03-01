import { query } from '../config/database.js';

// ============================================
// UNIT MODEL
// ============================================

export const unitModel = {

    // Get all units (optionally filter by property)
    async findAll(propertyId = null) {
        let sql = `
      SELECT 
        u.id, u.property_id, u.unit_number, u.bedrooms, 
        u.bathrooms, u.square_feet, u.created_at,
        p.name as property_name
      FROM units u
      JOIN properties p ON u.property_id = p.id
    `;

        const params = [];

        if (propertyId) {
            sql += ` WHERE u.property_id = $1`;
            params.push(propertyId);
        }

        sql += ` ORDER BY u.property_id, u.unit_number`;

        const result = await query(sql, params);
        return result.rows;
    },

    // Get single unit by ID
    async findById(id) {
        const sql = `
      SELECT 
        u.id, u.property_id, u.unit_number, u.bedrooms,
        u.bathrooms, u.square_feet, u.created_at,
        p.name as property_name
      FROM units u
      JOIN properties p ON u.property_id = p.id
      WHERE u.id = $1
    `;
        const result = await query(sql, [id]);
        return result.rows[0];
    },

    // Create new unit
    async create(unitData) {
        const { property_id, unit_number, bedrooms, bathrooms, square_feet } = unitData;
        const sql = `
      INSERT INTO units (property_id, unit_number, bedrooms, bathrooms, square_feet)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const result = await query(sql, [property_id, unit_number, bedrooms, bathrooms, square_feet]);
        return result.rows[0];
    },

    // Update unit
    async update(id, unitData) {
        const { property_id, unit_number, bedrooms, bathrooms, square_feet } = unitData;
        const sql = `
      UPDATE units
      SET property_id = $1, unit_number = $2, bedrooms = $3, 
          bathrooms = $4, square_feet = $5
      WHERE id = $6
      RETURNING *
    `;
        const result = await query(sql, [property_id, unit_number, bedrooms, bathrooms, square_feet, id]);
        return result.rows[0];
    },

    // Delete unit
    async delete(id) {
        const sql = `DELETE FROM units WHERE id = $1 RETURNING *`;
        const result = await query(sql, [id]);
        return result.rows[0];
    },

    // Check if unit number exists for a property (for validation)
    async findByPropertyAndUnitNumber(propertyId, unitNumber) {
        const sql = `
      SELECT id FROM units 
      WHERE property_id = $1 AND unit_number = $2
    `;
        const result = await query(sql, [propertyId, unitNumber]);
        return result.rows[0];
    }
};