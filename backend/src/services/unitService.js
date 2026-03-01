import { unitModel } from '../models/unitModel.js';
import { propertyModel } from '../models/propertyModel.js';

export const unitService = {

    async getAllUnits(propertyId = null) {
        return await unitModel.findAll(propertyId);
    },

    async getUnitById(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, message: 'Invalid unit ID' };
        }

        const unit = await unitModel.findById(id);

        if (!unit) {
            throw { status: 404, message: 'Unit not found' };
        }

        return unit;
    },

    async createUnit(unitData) {
        const { property_id, unit_number, bedrooms, bathrooms, square_feet } = unitData;

        // Validate property_id
        if (!property_id || isNaN(property_id)) {
            throw { status: 400, message: 'Valid property ID is required' };
        }

        // Check if property exists
        const property = await propertyModel.findById(property_id);
        if (!property) {
            throw { status: 404, message: 'Property not found' };
        }

        // Validate unit_number
        if (!unit_number || unit_number.trim().length === 0) {
            throw { status: 400, message: 'Unit number is required' };
        }

        // Check for duplicate unit number within the property
        const existingUnit = await unitModel.findByPropertyAndUnitNumber(
            property_id,
            unit_number.trim()
        );
        if (existingUnit) {
            throw {
                status: 400,
                message: `Unit ${unit_number} already exists in this property`
            };
        }

        // Validate bedrooms
        if (bedrooms === undefined || bedrooms === null || isNaN(bedrooms)) {
            throw { status: 400, message: 'Number of bedrooms is required' };
        }
        if (bedrooms < 0) {
            throw { status: 400, message: 'Bedrooms cannot be negative' };
        }

        // Validate bathrooms
        if (bathrooms === undefined || bathrooms === null || isNaN(bathrooms)) {
            throw { status: 400, message: 'Number of bathrooms is required' };
        }
        if (bathrooms < 0) {
            throw { status: 400, message: 'Bathrooms cannot be negative' };
        }

        // Validate square_feet (optional, but must be positive if provided)
        if (square_feet !== undefined && square_feet !== null) {
            if (isNaN(square_feet) || square_feet <= 0) {
                throw { status: 400, message: 'Square feet must be a positive number' };
            }
        }

        // Clean data
        const cleanedData = {
            property_id,
            unit_number: unit_number.trim(),
            bedrooms: Number(bedrooms),
            bathrooms: Number(bathrooms),
            square_feet: square_feet ? Number(square_feet) : null
        };

        return await unitModel.create(cleanedData);
    },

    async updateUnit(id, unitData) {
        if (!id || isNaN(id)) {
            throw { status: 400, message: 'Invalid unit ID' };
        }

        // Check if unit exists
        const existingUnit = await unitModel.findById(id);
        if (!existingUnit) {
            throw { status: 404, message: 'Unit not found' };
        }

        const { property_id, unit_number, bedrooms, bathrooms, square_feet } = unitData;

        // Validate property_id
        if (!property_id || isNaN(property_id)) {
            throw { status: 400, message: 'Valid property ID is required' };
        }

        // Check if property exists
        const property = await propertyModel.findById(property_id);
        if (!property) {
            throw { status: 404, message: 'Property not found' };
        }

        // Validate unit_number
        if (!unit_number || unit_number.trim().length === 0) {
            throw { status: 400, message: 'Unit number is required' };
        }

        // Check for duplicate unit number (excluding current unit)
        const duplicateUnit = await unitModel.findByPropertyAndUnitNumber(
            property_id,
            unit_number.trim()
        );
        if (duplicateUnit && duplicateUnit.id !== Number(id)) {
            throw {
                status: 400,
                message: `Unit ${unit_number} already exists in this property`
            };
        }

        // Validate bedrooms
        if (bedrooms === undefined || bedrooms === null || isNaN(bedrooms)) {
            throw { status: 400, message: 'Number of bedrooms is required' };
        }
        if (bedrooms < 0) {
            throw { status: 400, message: 'Bedrooms cannot be negative' };
        }

        // Validate bathrooms
        if (bathrooms === undefined || bathrooms === null || isNaN(bathrooms)) {
            throw { status: 400, message: 'Number of bathrooms is required' };
        }
        if (bathrooms < 0) {
            throw { status: 400, message: 'Bathrooms cannot be negative' };
        }

        // Validate square_feet
        if (square_feet !== undefined && square_feet !== null) {
            if (isNaN(square_feet) || square_feet <= 0) {
                throw { status: 400, message: 'Square feet must be a positive number' };
            }
        }

        // Clean data
        const cleanedData = {
            property_id,
            unit_number: unit_number.trim(),
            bedrooms: Number(bedrooms),
            bathrooms: Number(bathrooms),
            square_feet: square_feet ? Number(square_feet) : null
        };

        return await unitModel.update(id, cleanedData);
    },

    async deleteUnit(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, message: 'Invalid unit ID' };
        }

        const existingUnit = await unitModel.findById(id);
        if (!existingUnit) {
            throw { status: 404, message: 'Unit not found' };
        }

        // TODO: Later, check if unit has active leases before allowing deletion

        return await unitModel.delete(id);
    }
};