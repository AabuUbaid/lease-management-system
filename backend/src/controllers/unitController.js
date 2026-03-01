import { unitService } from '../services/unitService.js';

export const unitController = {

    async getAll(req, res, next) {
        try {
            const { property_id } = req.query; // Get from query string: /api/units?property_id=1
            const units = await unitService.getAllUnits(property_id);
            res.json(units);
        } catch (error) {
            next(error);
        }
    },

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const unit = await unitService.getUnitById(id);
            res.json(unit);
        } catch (error) {
            next(error);
        }
    },

    async create(req, res, next) {
        try {
            const unit = await unitService.createUnit(req.body);
            res.status(201).json(unit);
        } catch (error) {
            next(error);
        }
    },

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const unit = await unitService.updateUnit(id, req.body);
            res.json(unit);
        } catch (error) {
            next(error);
        }
    },

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await unitService.deleteUnit(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
};