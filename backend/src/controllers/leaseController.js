import { leaseService } from '../services/leaseService.js';

export const leaseController = {

    // GET /api/leases - Get all leases
    async getAll(req, res, next) {
        try {
            const leases = await leaseService.getAllLeases();
            res.json(leases);
        } catch (error) {
            next(error);
        }
    },

    // GET /api/leases/:id - Get single lease
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const lease = await leaseService.getLeaseById(id);
            res.json(lease);
        } catch (error) {
            next(error);
        }
    },

    // GET /api/leases/active - Get active leases
    async getActive(req, res, next) {
        try {
            const leases = await leaseService.getActiveLeases();
            res.json(leases);
        } catch (error) {
            next(error);
        }
    },

    // GET /api/leases/expiring?days=30 - Get expiring leases
    async getExpiring(req, res, next) {
        try {
            const days = req.query.days || 30;
            const leases = await leaseService.getExpiringLeases(days);
            res.json(leases);
        } catch (error) {
            next(error);
        }
    },

    // GET /api/units/vacant - Get vacant units
    async getVacantUnits(req, res, next) {
        try {
            const units = await leaseService.getVacantUnits();
            res.json(units);
        } catch (error) {
            next(error);
        }
    },

    // POST /api/leases - Create new lease
    async create(req, res, next) {
        try {
            const lease = await leaseService.createLease(req.body);
            res.status(201).json(lease);
        } catch (error) {
            next(error);
        }
    },

    // PUT /api/leases/:id - Update lease
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const lease = await leaseService.updateLease(id, req.body);
            res.json(lease);
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/leases/:id - Delete lease
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await leaseService.deleteLease(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
};