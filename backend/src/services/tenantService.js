import { tenantModel } from '../models/tenantModel.js';

export const tenantService = {

    async getAllTenants() {
        return await tenantModel.findAll();
    },

    async getTenantById(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, message: 'Invalid tenant ID' };
        }

        const tenant = await tenantModel.findById(id);

        if (!tenant) {
            throw { status: 404, message: 'Tenant not found' };
        }

        return tenant;
    },

    async createTenant(tenantData) {
        const { first_name, last_name, email, phone } = tenantData;

        // Validate required fields
        if (!first_name || first_name.trim().length === 0) {
            throw { status: 400, message: 'First name is required' };
        }

        if (!last_name || last_name.trim().length === 0) {
            throw { status: 400, message: 'Last name is required' };
        }

        if (!email || email.trim().length === 0) {
            throw { status: 400, message: 'Email is required' };
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw { status: 400, message: 'Invalid email format' };
        }

        // Check for duplicate email
        const existingTenant = await tenantModel.findByEmail(email.trim().toLowerCase());
        if (existingTenant) {
            throw { status: 400, message: 'Email already registered' };
        }

        // Clean data
        const cleanedData = {
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : null
        };

        return await tenantModel.create(cleanedData);
    },

    async updateTenant(id, tenantData) {
        if (!id || isNaN(id)) {
            throw { status: 400, message: 'Invalid tenant ID' };
        }

        // Check if tenant exists
        const existingTenant = await tenantModel.findById(id);
        if (!existingTenant) {
            throw { status: 404, message: 'Tenant not found' };
        }

        const { first_name, last_name, email, phone } = tenantData;

        // Validate required fields
        if (!first_name || first_name.trim().length === 0) {
            throw { status: 400, message: 'First name is required' };
        }

        if (!last_name || last_name.trim().length === 0) {
            throw { status: 400, message: 'Last name is required' };
        }

        if (!email || email.trim().length === 0) {
            throw { status: 400, message: 'Email is required' };
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw { status: 400, message: 'Invalid email format' };
        }

        // Check for duplicate email (excluding current tenant)
        const duplicateTenant = await tenantModel.findByEmail(email.trim().toLowerCase());
        if (duplicateTenant && duplicateTenant.id !== Number(id)) {
            throw { status: 400, message: 'Email already registered' };
        }

        // Clean data
        const cleanedData = {
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : null
        };

        return await tenantModel.update(id, cleanedData);
    },

    async deleteTenant(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, message: 'Invalid tenant ID' };
        }

        const existingTenant = await tenantModel.findById(id);
        if (!existingTenant) {
            throw { status: 404, message: 'Tenant not found' };
        }

        // TODO: Check if tenant has active leases before allowing deletion

        return await tenantModel.delete(id);
    }
};