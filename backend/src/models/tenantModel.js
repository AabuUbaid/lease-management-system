import { query } from '../config/database.js';

export const tenantModel = {

    async findAll() {
        const sql = `
      SELECT id, first_name, last_name, email, phone, created_at
      FROM tenants
      ORDER BY last_name, first_name
    `;
        const result = await query(sql);
        return result.rows;
    },

    async findById(id) {
        const sql = `
      SELECT id, first_name, last_name, email, phone, created_at
      FROM tenants
      WHERE id = $1
    `;
        const result = await query(sql, [id]);
        return result.rows[0];
    },

    async findByEmail(email) {
        const sql = `SELECT id, email FROM tenants WHERE email = $1`;
        const result = await query(sql, [email]);
        return result.rows[0];
    },

    async create(tenantData) {
        const { first_name, last_name, email, phone } = tenantData;
        const sql = `
      INSERT INTO tenants (first_name, last_name, email, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        const result = await query(sql, [first_name, last_name, email, phone]);
        return result.rows[0];
    },

    async update(id, tenantData) {
        const { first_name, last_name, email, phone } = tenantData;
        const sql = `
      UPDATE tenants
      SET first_name = $1, last_name = $2, email = $3, phone = $4
      WHERE id = $5
      RETURNING *
    `;
        const result = await query(sql, [first_name, last_name, email, phone, id]);
        return result.rows[0];
    },

    async delete(id) {
        const sql = `DELETE FROM tenants WHERE id = $1 RETURNING *`;
        const result = await query(sql, [id]);
        return result.rows[0];
    }
};