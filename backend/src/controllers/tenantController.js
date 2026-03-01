import { tenantService } from '../services/tenantService.js';

export const tenantController = {

    async getAll(req, res, next) {
        try {
            const tenants = await tenantService.getAllTenants();
            res.json(tenants);
        } catch (error) {
            next(error);
        }
    },

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const tenant = await tenantService.getTenantById(id);
            res.json(tenant);
        } catch (error) {
            next(error);
        }
    },

    async create(req, res, next) {
        try {
            const tenant = await tenantService.createTenant(req.body);
            res.status(201).json(tenant);
        } catch (error) {
            next(error);
        }
    },

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const tenant = await tenantService.updateTenant(id, req.body);
            res.json(tenant);
        } catch (error) {
            next(error);
        }
    },

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await tenantService.deleteTenant(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
};