import * as propertyRepository from '../repositories/propertyRepository.js';
import { Property } from '../entities/Property.js';
import { PropertyFilters } from '../repositories/propertyRepository.js';
import { AppError } from '../utils/errors.js';
import * as propertyEngagementRepository from '../repositories/propertyEngagementRepository.js';

const validatePropertyData = (data: Partial<Property>): void => {
  if (data.title !== undefined && data.title.trim().length === 0) {
    throw new AppError('Title cannot be empty', 400);
  }

  if (data.title !== undefined && data.title.length > 255) {
    throw new AppError('Title cannot exceed 255 characters', 400);
  }

  if (data.description !== undefined && data.description.trim().length === 0) {
    throw new AppError('Description cannot be empty', 400);
  }

  if (data.listingType && !['rent', 'sale', 'lease'].includes(data.listingType)) {
    throw new AppError('Listing type must be either "sale" or "lease"', 400);
  }

  if (data.furnishing && !['Fully', 'Partially', 'Unfurnished'].includes(data.furnishing)) {
    throw new AppError('Furnishing must be "Fully", "Partially", or "Unfurnished"', 400);
  }

  if (
    data.availability &&
    !['Immediate', 'Next month', 'Under Construction'].includes(data.availability)
  ) {
    throw new AppError(
      'Availability must be "Immediate", "Next month", or "Under Construction"',
      400
    );
  }

  if (data.price !== undefined && data.price < 0) {
    throw new AppError('Price cannot be negative', 400);
  }

  if (data.buildupArea !== undefined && data.buildupArea < 0) {
    throw new AppError('Buildup area cannot be negative', 400);
  }

  if (data.landSize !== undefined && data.landSize < 0) {
    throw new AppError('Land size cannot be negative', 400);
  }

  if (data.depositAmount !== undefined && data.depositAmount < 0) {
    throw new AppError('Deposit amount cannot be negative', 400);
  }

  if (data.maintenanceFee !== undefined && data.maintenanceFee < 0) {
    throw new AppError('Maintenance fee cannot be negative', 400);
  }

  if (data.sinkingFund !== undefined && data.sinkingFund < 0) {
    throw new AppError('Sinking fund cannot be negative', 400);
  }

  if (data.bedrooms !== undefined && (data.bedrooms < 0 || !Number.isInteger(data.bedrooms))) {
    throw new AppError('Bedrooms must be a non-negative integer', 400);
  }

  if (data.bathrooms !== undefined && (data.bathrooms < 0 || !Number.isInteger(data.bathrooms))) {
    throw new AppError('Bathrooms must be a non-negative integer', 400);
  }

  if (data.yearOfBuild !== undefined) {
    const currentYear = new Date().getFullYear();
    if (data.yearOfBuild < 1800 || data.yearOfBuild > currentYear + 5) {
      throw new AppError(`Year of build must be between 1800 and ${currentYear + 5}`, 400);
    }
  }

  if (data.pincode && !/^[0-9A-Za-z\s-]{3,20}$/.test(data.pincode)) {
    throw new AppError('Invalid pincode format', 400);
  }

  if (data.images && data.images.length > 15) {
    throw new AppError('Maximum 15 images allowed', 400);
  }
};

export const createProperty = async (propertyData: Partial<Property>): Promise<Property> => {
  if (!propertyData.title || propertyData.title.trim().length === 0) {
    throw new AppError('Title is required', 400);
  }

  if (!propertyData.description || propertyData.description.trim().length === 0) {
    throw new AppError('Description is required', 400);
  }

  if (!propertyData.price || propertyData.price <= 0) {
    throw new AppError('Price is required and must be greater than 0', 400);
  }

  if (!propertyData.listingType) {
    throw new AppError('Listing type is required', 400);
  }

  if (!propertyData.propertyType) {
    throw new AppError('Property type is required', 400);
  }

  validatePropertyData(propertyData);

// COMMENT THIS WHOLE BLOCK
/*
if (
  propertyData.propertyName &&
  propertyData.streetName &&
  propertyData.cityName &&
  propertyData.state
) {
  const duplicate = await propertyRepository.findDuplicateProperty({
    propertyName: propertyData.propertyName,
    streetName: propertyData.streetName,
    cityName: propertyData.cityName,
    state: propertyData.state
  });

  if (duplicate) {
    throw new AppError(
      'A property with the same name and street already exists at this location',
      409
    );
  }
}
*/

  const property = await propertyRepository.createProperty(propertyData);

  return property;
};

export const getPropertyById = async (id: string): Promise<Property> => {
  const property = await propertyRepository.findPropertyById(id);

  if (!property) {
    throw new AppError('Property not found', 404);
  }

  return property;
};

export const getAllProperties = async (filters?: PropertyFilters): Promise<Property[]> => {
  return await propertyRepository.findAllProperties(filters);
};

export const getUserProperties = async (userId: string): Promise<Property[]> => {
  return await propertyRepository.findPropertiesByUserId(userId);
};

export const getAdminProperties = async (): Promise<Property[]> => {
  return await propertyRepository.findAllProperties({ status: '' });
};

export const recordPropertyView = async (input: {
  propertyId: string;
  viewerId?: string;
  visitorKey?: string;
}) => {
  const property = await propertyRepository.findPropertyById(input.propertyId);

  if (!property) {
    throw new AppError('Property not found', 404);
  }

  if (input.viewerId && property.userId === input.viewerId) {
    return { recorded: false, ignored: 'seller_view' };
  }

  if (!input.viewerId && !input.visitorKey) {
    throw new AppError('Visitor key is required for anonymous views', 400);
  }

  return await propertyEngagementRepository.recordPropertyView(input);
};

export const updateProperty = async (
  propertyId: string,
  userId: string,
  updates: Partial<Property>,
  isAdmin = false
): Promise<Property> => {
  const property = await propertyRepository.findPropertyById(propertyId);

  if (!property) {
    throw new AppError('Property not found', 404);
  }

  if (!isAdmin && property.userId !== userId) {
    throw new AppError('You are not authorized to update this property', 403);
  }

  validatePropertyData(updates);

  const updatedProperty = await propertyRepository.updateProperty(propertyId, updates);

  if (!updatedProperty) {
    throw new AppError('Failed to update property', 500);
  }

  return updatedProperty;
};

export const deleteProperty = async (
  propertyId: string,
  userId: string,
  isAdmin = false
): Promise<Property> => {
  const property = await propertyRepository.findPropertyById(propertyId);

  if (!property) {
    throw new AppError('Property not found', 404);
  }

  if (!isAdmin && property.userId !== userId) {
    throw new AppError('You are not authorized to delete this property', 403);
  }

  const updated = await propertyRepository.updateProperty(propertyId, { status: 'deactivate' });

  if (!updated) {
    throw new AppError('Failed to deactivate property', 500);
  }

  return updated;
};

export const searchProperties = async (filters: { q?: string; type?: string; city?: string; propertyName?: string; propertyType?: string }): Promise<Property[]> => {
  const hasFilter = filters.q || filters.type || filters.city || filters.propertyName || filters.propertyType;
  if (!hasFilter) {
    throw new AppError('At least one search filter is required', 400);
  }

  return await propertyRepository.searchProperties(filters);
};
