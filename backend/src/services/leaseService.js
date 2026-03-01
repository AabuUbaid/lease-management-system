import { leaseModel } from '../models/leaseModel.js';
import { unitModel } from '../models/unitModel.js';
import { tenantModel } from '../models/tenantModel.js';

export const leaseService = {

    async getAllLeases() {
        return await leaseModel.findAll();
    },

    async getLeaseById(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, message: 'Invalid lease ID' };
        }

        const lease = await leaseModel.findById(id);

        if (!lease) {
            throw { status: 404, message: 'Lease not found' };
        }

        return lease;
    },

    async getActiveLeases() {
        return await leaseModel.findActive();
    },

    async getExpiringLeases(days = 30) {
        if (isNaN(days) || days < 1) {
            throw { status: 400, message: 'Days must be a positive number' };
        }
        return await leaseModel.findExpiring(days);
    },

    async getVacantUnits() {
        return await leaseModel.findVacantUnits();
    },

    async createLease(leaseData) {
        const { unit_id, tenant_id, lease_start, lease_end, monthly_rent, security_deposit } = leaseData;

        // Validate unit_id
        if (!unit_id || isNaN(unit_id)) {
            throw { status: 400, message: 'Valid unit ID is required' };
        }

        // Check if unit exists
        const unit = await unitModel.findById(unit_id);
        if (!unit) {
            throw { status: 404, message: 'Unit not found' };
        }

        // Validate tenant_id
        if (!tenant_id || isNaN(tenant_id)) {
            throw { status: 400, message: 'Valid tenant ID is required' };
        }

        // Check if tenant exists
        const tenant = await tenantModel.findById(tenant_id);
        if (!tenant) {
            throw { status: 404, message: 'Tenant not found' };
        }

        // Validate lease_start
        if (!lease_start) {
            throw { status: 400, message: 'Lease start date is required' };
        }

        const startDate = new Date(lease_start);
        if (isNaN(startDate.getTime())) {
            throw { status: 400, message: 'Invalid lease start date format' };
        }

        // Validate lease_end
        if (!lease_end) {
            throw { status: 400, message: 'Lease end date is required' };
        }

        const endDate = new Date(lease_end);
        if (isNaN(endDate.getTime())) {
            throw { status: 400, message: 'Invalid lease end date format' };
        }

        // Business rule: End date must be after start date
        if (endDate <= startDate) {
            throw { status: 400, message: 'Lease end date must be after start date' };
        }

        // Validate monthly_rent
        if (!monthly_rent || isNaN(monthly_rent) || monthly_rent <= 0) {
            throw { status: 400, message: 'Valid monthly rent (greater than 0) is required' };
        }

        // Validate security_deposit (optional, but must be valid if provided)
        if (security_deposit !== undefined && security_deposit !== null) {
            if (isNaN(security_deposit) || security_deposit < 0) {
                throw { status: 400, message: 'Security deposit must be a non-negative number' };
            }
        }

        // CRITICAL: Check for overlapping leases
        const overlappingLeases = await leaseModel.findOverlapping(
            unit_id,
            lease_start,
            lease_end
        );

        if (overlappingLeases.length > 0) {
            const existingLease = overlappingLeases[0];
            throw {
                status: 409, // 409 = Conflict
                message: `Lease dates overlap with existing lease (${existingLease.lease_start} to ${existingLease.lease_end})`
            };
        }

        // Clean data
        const cleanedData = {
            unit_id: Number(unit_id),
            tenant_id: Number(tenant_id),
            lease_start,
            lease_end,
            monthly_rent: Number(monthly_rent),
            security_deposit: security_deposit ? Number(security_deposit) : null
        };

        return await leaseModel.create(cleanedData);
    },

    async updateLease(id, leaseData) {
        if (!id || isNaN(id)) {
            throw { status: 400, message: 'Invalid lease ID' };
        }

        // Check if lease exists
        const existingLease = await leaseModel.findById(id);
        if (!existingLease) {
            throw { status: 404, message: 'Lease not found' };
        }

        const { unit_id, tenant_id, lease_start, lease_end, monthly_rent, security_deposit } = leaseData;

        // Validate unit_id
        if (!unit_id || isNaN(unit_id)) {
            throw { status: 400, message: 'Valid unit ID is required' };
        }

        // Check if unit exists
        const unit = await unitModel.findById(unit_id);
        if (!unit) {
            throw { status: 404, message: 'Unit not found' };
        }

        // Validate tenant_id
        if (!tenant_id || isNaN(tenant_id)) {
            throw { status: 400, message: 'Valid tenant ID is required' };
        }

        // Check if tenant exists
        const tenant = await tenantModel.findById(tenant_id);
        if (!tenant) {
            throw { status: 404, message: 'Tenant not found' };
        }

        // Validate lease_start
        if (!lease_start) {
            throw { status: 400, message: 'Lease start date is required' };
        }

        const startDate = new Date(lease_start);
        if (isNaN(startDate.getTime())) {
            throw { status: 400, message: 'Invalid lease start date format' };
        }

        // Validate lease_end
        if (!lease_end) {
            throw { status: 400, message: 'Lease end date is required' };
        }

        const endDate = new Date(lease_end);
        if (isNaN(endDate.getTime())) {
            throw { status: 400, message: 'Invalid lease end date format' };
        }

        // Business rule: End date must be after start date
        if (endDate <= startDate) {
            throw { status: 400, message: 'Lease end date must be after start date' };
        }

        // Validate monthly_rent
        if (!monthly_rent || isNaN(monthly_rent) || monthly_rent <= 0) {
            throw { status: 400, message: 'Valid monthly rent (greater than 0) is required' };
        }

        // Validate security_deposit
        if (security_deposit !== undefined && security_deposit !== null) {
            if (isNaN(security_deposit) || security_deposit < 0) {
                throw { status: 400, message: 'Security deposit must be a non-negative number' };
            }
        }

        // Check for overlapping leases (excluding the current lease being updated)
        const overlappingLeases = await leaseModel.findOverlapping(
            unit_id,
            lease_start,
            lease_end,
            id // Exclude current lease from overlap check
        );

        if (overlappingLeases.length > 0) {
            const existingLease = overlappingLeases[0];
            throw {
                status: 409,
                message: `Lease dates overlap with existing lease (${existingLease.lease_start} to ${existingLease.lease_end})`
            };
        }

        // Clean data
        const cleanedData = {
            unit_id: Number(unit_id),
            tenant_id: Number(tenant_id),
            lease_start,
            lease_end,
            monthly_rent: Number(monthly_rent),
            security_deposit: security_deposit ? Number(security_deposit) : null
        };

        return await leaseModel.update(id, cleanedData);
    },

    async deleteLease(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, message: 'Invalid lease ID' };
        }

        const existingLease = await leaseModel.findById(id);
        if (!existingLease) {
            throw { status: 404, message: 'Lease not found' };
        }

        // Business consideration: In production, you might want to prevent
        // deletion of active leases or require a reason for deletion
        // For now, we allow all deletions for flexibility

        return await leaseModel.delete(id);
    }
};