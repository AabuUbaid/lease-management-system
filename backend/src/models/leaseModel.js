import { query } from '../config/database.js';

export const leaseModel = {

    // Get all leases (with unit and tenant info)
    async findAll() {
        const sql = `
      SELECT 
        l.id, l.unit_id, l.tenant_id, l.lease_start, l.lease_end,
        l.monthly_rent, l.security_deposit, l.created_at,
        u.unit_number, p.name as property_name,
        t.first_name, t.last_name, t.email
      FROM leases l
      JOIN units u ON l.unit_id = u.id
      JOIN properties p ON u.property_id = p.id
      JOIN tenants t ON l.tenant_id = t.id
      ORDER BY l.lease_start DESC
    `;
        const result = await query(sql);
        return result.rows;
    },

    // Get single lease by ID
    async findById(id) {
        const sql = `
      SELECT 
        l.id, l.unit_id, l.tenant_id, l.lease_start, l.lease_end,
        l.monthly_rent, l.security_deposit, l.created_at,
        u.unit_number, p.name as property_name, p.id as property_id,
        t.first_name, t.last_name, t.email
      FROM leases l
      JOIN units u ON l.unit_id = u.id
      JOIN properties p ON u.property_id = p.id
      JOIN tenants t ON l.tenant_id = t.id
      WHERE l.id = $1
    `;
        const result = await query(sql, [id]);
        return result.rows[0];
    },

    // Check for overlapping leases (CRITICAL QUERY)
    async findOverlapping(unitId, leaseStart, leaseEnd, excludeLeaseId = null) {
        let sql = `
      SELECT id, lease_start, lease_end
      FROM leases
      WHERE unit_id = $1
        AND lease_start <= $3
        AND lease_end >= $2
    `;

        const params = [unitId, leaseStart, leaseEnd];

        // When updating, exclude the current lease from overlap check
        if (excludeLeaseId) {
            sql += ` AND id != $4`;
            params.push(excludeLeaseId);
        }

        const result = await query(sql, params);
        return result.rows;
    },

    // Get active leases (lease period includes today)
    async findActive() {
        const sql = `
      SELECT 
        l.id, l.unit_id, l.tenant_id, l.lease_start, l.lease_end,
        l.monthly_rent, l.security_deposit,
        u.unit_number, p.name as property_name,
        t.first_name, t.last_name
      FROM leases l
      JOIN units u ON l.unit_id = u.id
      JOIN properties p ON u.property_id = p.id
      JOIN tenants t ON l.tenant_id = t.id
      WHERE CURRENT_DATE BETWEEN l.lease_start AND l.lease_end
      ORDER BY p.name, u.unit_number
    `;
        const result = await query(sql);
        return result.rows;
    },

    // Get expiring leases (ending within next 30 days)
    async findExpiring(days = 30) {
        const sql = `
      SELECT 
        l.id, l.unit_id, l.tenant_id, l.lease_start, l.lease_end,
        l.monthly_rent, l.security_deposit,
        u.unit_number, p.name as property_name,
        t.first_name, t.last_name, t.email, t.phone
      FROM leases l
      JOIN units u ON l.unit_id = u.id
      JOIN properties p ON u.property_id = p.id
      JOIN tenants t ON l.tenant_id = t.id
      WHERE l.lease_end BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day' * $1
      ORDER BY l.lease_end ASC
    `;
        const result = await query(sql, [days]);
        return result.rows;
    },

    // Get vacant units (no active lease)
    async findVacantUnits() {
        const sql = `
      SELECT 
        u.id, u.unit_number, u.bedrooms, u.bathrooms, u.square_feet,
        p.name as property_name, p.address
      FROM units u
      JOIN properties p ON u.property_id = p.id
      WHERE NOT EXISTS (
        SELECT 1 FROM leases l
        WHERE l.unit_id = u.id
          AND CURRENT_DATE BETWEEN l.lease_start AND l.lease_end
      )
      ORDER BY p.name, u.unit_number
    `;
        const result = await query(sql);
        return result.rows;
    },

    // Create new lease
    async create(leaseData) {
        const { unit_id, tenant_id, lease_start, lease_end, monthly_rent, security_deposit } = leaseData;
        const sql = `
      INSERT INTO leases (unit_id, tenant_id, lease_start, lease_end, monthly_rent, security_deposit)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
        const result = await query(sql, [unit_id, tenant_id, lease_start, lease_end, monthly_rent, security_deposit]);
        return result.rows[0];
    },

    // Update lease
    async update(id, leaseData) {
        const { unit_id, tenant_id, lease_start, lease_end, monthly_rent, security_deposit } = leaseData;
        const sql = `
      UPDATE leases
      SET unit_id = $1, tenant_id = $2, lease_start = $3, lease_end = $4,
          monthly_rent = $5, security_deposit = $6
      WHERE id = $7
      RETURNING *
    `;
        const result = await query(sql, [unit_id, tenant_id, lease_start, lease_end, monthly_rent, security_deposit, id]);
        return result.rows[0];
    },

    // Delete lease
    async delete(id) {
        const sql = `DELETE FROM leases WHERE id = $1 RETURNING *`;
        const result = await query(sql, [id]);
        return result.rows[0];
    }
};