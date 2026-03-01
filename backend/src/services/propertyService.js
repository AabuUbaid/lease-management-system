import { propertyModel } from '../models/propertyModel.js';

// ============================================
// PROPERTY SERVICE
// Business logic and validation
// ============================================

export const propertyService = {

    // Get all properties
    async getAllProperties() {
        return await propertyModel.findAll();
    },

    // Get single property by ID
    async getPropertyById(id) {
        // Validate ID
        if (!id || isNaN(id)) {
            throw { status: 400, message: 'Invalid property ID' };
        }

        const property = await propertyModel.findById(id);

        if (!property) {
            throw { status: 404, message: 'Property not found' };
        }

        return property;
    },

    // Create new property
    async createProperty(propertyData) {
        // Validation
        const { name, address, city, state, zip_code } = propertyData;

        if (!name || name.trim().length === 0) {
            throw { status: 400, message: 'Property name is required' };
        }

        if (!address || address.trim().length === 0) {
            throw { status: 400, message: 'Address is required' };
        }

        if (!city || city.trim().length === 0) {
            throw { status: 400, message: 'City is required' };
        }

        if (!state || state.trim().length === 0) {
            throw { status: 400, message: 'State is required' };
        }

        if (!zip_code || zip_code.trim().length === 0) {
            throw { status: 400, message: 'Zip code is required' };
        }

        // Business rule: Trim whitespace
        const cleanedData = {
            name: name.trim(),
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            zip_code: zip_code.trim()
        };

        // Create property
        return await propertyModel.create(cleanedData);
    },

    // Update property
    async updateProperty(id, propertyData) {
        // Validate ID
        if (!id || isNaN(id)) {
            throw { status: 400, message: 'Invalid property ID' };
        }

        // Check if property exists
        const existingProperty = await propertyModel.findById(id);
        if (!existingProperty) {
            throw { status: 404, message: 'Property not found' };
        }

        // Validation (same as create)
        const { name, address, city, state, zip_code } = propertyData;

        if (!name || name.trim().length === 0) {
            throw { status: 400, message: 'Property name is required' };
        }

        if (!address || address.trim().length === 0) {
            throw { status: 400, message: 'Address is required' };
        }

        if (!city || city.trim().length === 0) {
            throw { status: 400, message: 'City is required' };
        }

        if (!state || state.trim().length === 0) {
            throw { status: 400, message: 'State is required' };
        }

        if (!zip_code || zip_code.trim().length === 0) {
            throw { status: 400, message: 'Zip code is required' };
        }

        // Clean data
        const cleanedData = {
            name: name.trim(),
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            zip_code: zip_code.trim()
        };

        return await propertyModel.update(id, cleanedData);
    },

    // Delete property
    async deleteProperty(id) {
        // Validate ID
        if (!id || isNaN(id)) {
            throw { status: 400, message: 'Invalid property ID' };
        }

        // Check if property exists
        const existingProperty = await propertyModel.findById(id);
        if (!existingProperty) {
            throw { status: 404, message: 'Property not found' };
        }

        // Business rule: Check if property has units
        // TODO: Later we'll query units table to prevent deletion if units exist

        return await propertyModel.delete(id);
    }
};