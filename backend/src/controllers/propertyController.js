import { propertyService } from '../services/propertyService.js';

// ============================================
// PROPERTY CONTROLLER
// HTTP request/response handling
// ============================================

export const propertyController = {

    // GET /api/properties - Get all properties
    async getAll(req, res, next) {
        try {
            const properties = await propertyService.getAllProperties();
            res.json(properties);
        } catch (error) {
            next(error);
        }
    },

    // GET /api/properties/:id - Get single property
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const property = await propertyService.getPropertyById(id);
            res.json(property);
        } catch (error) {
            next(error);
        }
    },

    // POST /api/properties - Create new property
    async create(req, res, next) {
        try {
            const property = await propertyService.createProperty(req.body);
            res.status(201).json(property);
        } catch (error) {
            next(error);
        }
    },

    // PUT /api/properties/:id - Update property
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const property = await propertyService.updateProperty(id, req.body);
            res.json(property);
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/properties/:id - Delete property
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await propertyService.deleteProperty(id);
            res.status(204).send(); // 204 = No Content (success, but no body)
        } catch (error) {
            next(error);
        }
    }
};