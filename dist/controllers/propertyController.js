import * as propertyService from '../services/propertyService.js';
import * as propertyFitService from '../services/propertyFitService.js';
import { AppError } from '../utils/errors.js';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUuid = (value) => UUID_REGEX.test(value);
const parseOptionalFloat = (value) => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    const parsed = typeof value === 'number' ? value : parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : undefined;
};
const parseOptionalInteger = (value) => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    const parsed = typeof value === 'number' ? value : parseInt(String(value), 10);
    return Number.isFinite(parsed) ? parsed : undefined;
};
const parseOptionalBoolean = (value) => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
    }
    return Boolean(value);
};
const parseOptionalPositiveInteger = (value) => {
    const parsed = parseOptionalInteger(value);
    return parsed !== undefined && parsed > 0 ? parsed : undefined;
};
const normalizeAmenities = (value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const amenities = value;
        return {
            lifestyle: Array.isArray(amenities.lifestyle) ? amenities.lifestyle : [],
            facilities: Array.isArray(amenities.facilities) ? amenities.facilities : [],
            security: Array.isArray(amenities.security) ? amenities.security : []
        };
    }
    return undefined;
};
const normalizeImageItem = (value, index) => {
    if (typeof value === 'string' && value.trim()) {
        return value.trim();
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    const image = value;
    const rawUrl = image.url ?? image.imageUrl ?? image.src;
    if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
        return null;
    }
    const category = typeof image.category === 'string' && image.category.trim()
        ? image.category.trim()
        : 'other';
    const customPlaceName = typeof image.customPlaceName === 'string'
        ? image.customPlaceName.trim()
        : '';
    const displayPlace = typeof image.displayPlace === 'string' && image.displayPlace.trim()
        ? image.displayPlace.trim()
        : customPlaceName || category;
    return {
        url: rawUrl.trim(),
        fileName: typeof image.fileName === 'string' ? image.fileName : undefined,
        order: parseOptionalPositiveInteger(image.order) ?? index + 1,
        category,
        customPlaceName,
        displayPlace,
        caption: typeof image.caption === 'string' ? image.caption.trim() : displayPlace,
        isCover: parseOptionalBoolean(image.isCover) ?? false
    };
};
const propertyBodyKeys = {
    title: ['title'],
    description: ['description'],
    listingType: ['listingType', 'listing_type'],
    propertyType: ['propertyType', 'property_type'],
    tenure: ['tenure'],
    propertyName: ['propertyName', 'property_name'],
    streetName: ['streetName', 'street_name'],
    cityName: ['cityName', 'city_name'],
    state: ['state'],
    county: ['county'],
    pincode: ['pincode'],
    landmark: ['landmark'],
    location: ['location'],
    furnishing: ['furnishing'],
    availability: ['availability'],
    floorLevel: ['floorLevel', 'floor_level'],
    status: ['status'],
    negotiable: ['negotiable'],
    images: ['images'],
    floorPlan: ['floorPlan', 'floor_plan'],
    amenities: ['amenities'],
    price: ['price'],
    buildupArea: ['buildupArea', 'buildup_area'],
    landSize: ['landSize', 'land_size'],
    latitude: ['latitude'],
    longitude: ['longitude'],
    bedrooms: ['bedrooms'],
    bathrooms: ['bathrooms'],
    yearOfBuild: ['yearOfBuild', 'year_of_build'],
    yearOfCompletion: ['yearOfCompletion', 'year_of_completion'],
    carParkAllocation: ['carParkAllocation', 'car_park_allocation'],
    facingDirection: ['facingDirection', 'facing_direction'],
    renovationStatus: ['renovationStatus', 'renovation_status'],
    depositAmount: ['depositAmount', 'deposit_amount'],
    minimumRentalPeriod: ['minimumRentalPeriod', 'minimum_rental_period'],
    petPolicy: ['petPolicy', 'pet_policy'],
    preferredTenantType: ['preferredTenantType', 'preferred_tenant_type'],
    maintenanceFee: ['maintenanceFee', 'maintenance_fee'],
    sinkingFund: ['sinkingFund', 'sinking_fund'],
    bumiLotStatus: ['bumiLotStatus', 'bumi_lot_status']
};
const getBodyValue = (body, field) => {
    for (const key of propertyBodyKeys[field]) {
        if (body[key] !== undefined) {
            return body[key];
        }
    }
    return undefined;
};
const buildPropertyPayload = (body, options = {}) => {
    const propertyData = {};
    const stringFields = [
        'title',
        'description',
        'listingType',
        'propertyType',
        'tenure',
        'propertyName',
        'streetName',
        'cityName',
        'state',
        'county',
        'pincode',
        'landmark',
        'location',
        'furnishing',
        'availability',
        'floorLevel',
        'floorPlan',
        'carParkAllocation',
        'facingDirection',
        'renovationStatus',
        'minimumRentalPeriod',
        'petPolicy',
        'preferredTenantType',
        'bumiLotStatus',
        'status'
    ];
    for (const field of stringFields) {
        const value = getBodyValue(body, field);
        if (value !== undefined) {
            propertyData[field] = value;
        }
    }
    if (options.includeDefaults && propertyData.status === undefined) {
        propertyData.status = 'active';
    }
    const negotiable = parseOptionalBoolean(getBodyValue(body, 'negotiable'));
    if (negotiable !== undefined) {
        propertyData.negotiable = negotiable;
    }
    const images = getBodyValue(body, 'images');
    if (Array.isArray(images)) {
        const normalizedImages = images
            .map((image, index) => normalizeImageItem(image, index))
            .filter((image) => image !== null);
        const hasObjectCover = normalizedImages.some((image) => typeof image !== 'string' && image.isCover);
        let coverAssigned = false;
        propertyData.images = normalizedImages.map((image, index) => {
            if (typeof image === 'string')
                return image;
            const shouldBeCover = hasObjectCover ? Boolean(image.isCover && !coverAssigned) : index === 0;
            if (shouldBeCover)
                coverAssigned = true;
            return {
                ...image,
                order: index + 1,
                isCover: shouldBeCover
            };
        });
    }
    const amenities = normalizeAmenities(getBodyValue(body, 'amenities'));
    if (amenities || options.includeDefaults) {
        propertyData.amenities = amenities ?? { lifestyle: [], facilities: [], security: [] };
    }
    const price = parseOptionalFloat(getBodyValue(body, 'price'));
    if (price !== undefined)
        propertyData.price = price;
    const buildupArea = parseOptionalFloat(getBodyValue(body, 'buildupArea'));
    if (buildupArea !== undefined)
        propertyData.buildupArea = buildupArea;
    const landSize = parseOptionalFloat(getBodyValue(body, 'landSize'));
    if (landSize !== undefined)
        propertyData.landSize = landSize;
    const depositAmount = parseOptionalFloat(getBodyValue(body, 'depositAmount'));
    if (depositAmount !== undefined)
        propertyData.depositAmount = depositAmount;
    const maintenanceFee = parseOptionalFloat(getBodyValue(body, 'maintenanceFee'));
    if (maintenanceFee !== undefined)
        propertyData.maintenanceFee = maintenanceFee;
    const sinkingFund = parseOptionalFloat(getBodyValue(body, 'sinkingFund'));
    if (sinkingFund !== undefined)
        propertyData.sinkingFund = sinkingFund;
    const latitude = parseOptionalFloat(getBodyValue(body, 'latitude'));
    if (latitude !== undefined)
        propertyData.latitude = latitude;
    const longitude = parseOptionalFloat(getBodyValue(body, 'longitude'));
    if (longitude !== undefined)
        propertyData.longitude = longitude;
    const bedrooms = parseOptionalInteger(getBodyValue(body, 'bedrooms'));
    if (bedrooms !== undefined)
        propertyData.bedrooms = bedrooms;
    const bathrooms = parseOptionalInteger(getBodyValue(body, 'bathrooms'));
    if (bathrooms !== undefined)
        propertyData.bathrooms = bathrooms;
    const yearOfBuild = parseOptionalInteger(getBodyValue(body, 'yearOfBuild'));
    if (yearOfBuild !== undefined)
        propertyData.yearOfBuild = yearOfBuild;
    const yearOfCompletion = parseOptionalInteger(getBodyValue(body, 'yearOfCompletion'));
    if (yearOfCompletion !== undefined)
        propertyData.yearOfCompletion = yearOfCompletion;
    if (options.userId) {
        propertyData.userId = options.userId;
    }
    return propertyData;
};
export const createProperty = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }
        const propertyData = buildPropertyPayload(req.body, { includeDefaults: true, userId });
        const property = await propertyService.createProperty(propertyData);
        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            data: property
        });
    }
    catch (error) {
        if (error instanceof AppError) {
            res.status(error.status).json({
                success: false,
                message: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Failed to create property'
            });
        }
    }
};
export const getPropertyById = async (req, res) => {
    try {
        const propertyId = req.params.id;
        if (!propertyId) {
            res.status(400).json({
                success: false,
                message: 'Property ID is required'
            });
            return;
        }
        if (!isValidUuid(propertyId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
            return;
        }
        const property = await propertyService.getPropertyById(propertyId);
        res.status(200).json({
            success: true,
            data: property
        });
    }
    catch (error) {
        if (error instanceof AppError) {
            res.status(error.status).json({
                success: false,
                message: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch property'
            });
        }
    }
};
export const getAllProperties = async (req, res) => {
    try {
        const filters = {
            listingType: req.query.listingType,
            propertyType: req.query.propertyType,
            tenure: req.query.tenure,
            furnishing: req.query.furnishing,
            availability: req.query.availability,
            cityName: req.query.cityName,
            state: req.query.state,
            status: req.query.status,
            minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
            minBedrooms: req.query.minBedrooms ? parseInt(req.query.minBedrooms) : undefined,
            maxBedrooms: req.query.maxBedrooms ? parseInt(req.query.maxBedrooms) : undefined,
            minBathrooms: req.query.minBathrooms
                ? parseInt(req.query.minBathrooms)
                : undefined,
            minArea: req.query.minArea ? parseFloat(req.query.minArea) : undefined,
            negotiable: req.query.negotiable === 'true' ? true : req.query.negotiable === 'false' ? false : undefined,
            swimmingPool: req.query.swimmingPool === 'true' ? true : undefined,
            gymnasium: req.query.gymnasium === 'true' ? true : undefined,
            coveredParking: req.query.coveredParking === 'true' ? true : undefined,
            security24h: req.query.security24h === 'true' ? true : undefined
        };
        const properties = await propertyService.getAllProperties(filters);
        res.status(200).json({
            success: true,
            count: properties.length,
            data: properties
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch properties'
        });
    }
};
export const getUserProperties = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }
        const properties = await propertyService.getUserProperties(userId);
        res.status(200).json({
            success: true,
            count: properties.length,
            data: properties
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user properties'
        });
    }
};
export const updateProperty = async (req, res) => {
    try {
        const userId = req.user?.id;
        const propertyId = req.params.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }
        if (!propertyId) {
            res.status(400).json({
                success: false,
                message: 'Property ID is required'
            });
            return;
        }
        if (!isValidUuid(propertyId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
            return;
        }
        const propertyData = buildPropertyPayload(req.body);
        const updatedProperty = await propertyService.updateProperty(propertyId, userId, propertyData);
        res.status(200).json({
            success: true,
            message: 'Property updated successfully',
            data: updatedProperty
        });
    }
    catch (error) {
        if (error instanceof AppError) {
            res.status(error.status).json({
                success: false,
                message: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Failed to update property'
            });
        }
    }
};
export const deleteProperty = async (req, res) => {
    try {
        const userId = req.user?.id;
        const propertyId = req.params.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }
        if (!propertyId) {
            res.status(400).json({
                success: false,
                message: 'Property ID is required'
            });
            return;
        }
        if (!isValidUuid(propertyId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
            return;
        }
        const property = await propertyService.deleteProperty(propertyId, userId);
        res.status(200).json({
            success: true,
            message: 'Property deactivated successfully',
            data: property
        });
    }
    catch (error) {
        if (error instanceof AppError) {
            res.status(error.status).json({
                success: false,
                message: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Failed to deactivate property'
            });
        }
    }
};
export const searchProperties = async (req, res) => {
    try {
        const q = req.query.q;
        const type = req.query.type;
        const city = req.query.city;
        const propertyName = req.query.propertyName;
        const filters = { q, type, city, propertyName };
        const hasFilter = q || type || city || propertyName;
        if (!hasFilter) {
            res.status(400).json({
                success: false,
                message: 'At least one filter (q, type, city, or propertyName) is required'
            });
            return;
        }
        const properties = await propertyService.searchProperties(filters);
        res.status(200).json({
            success: true,
            count: properties.length,
            data: properties
        });
    }
    catch (error) {
        if (error instanceof AppError) {
            res.status(error.status).json({
                success: false,
                message: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Failed to search properties'
            });
        }
    }
};
export const getPropertyFitMatches = async (req, res) => {
    try {
        const result = await propertyFitService.getPropertyFitMatches(req.body);
        res.status(200).json({
            success: true,
            ...result
        });
    }
    catch (error) {
        if (error instanceof AppError) {
            res.status(error.status).json({
                success: false,
                message: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Failed to get property fit matches'
            });
        }
    }
};
export const notifyPropertyFitView = async (req, res) => {
    try {
        const result = await propertyFitService.notifyPropertyViewed(req.body);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        if (error instanceof AppError) {
            res.status(error.status).json({
                success: false,
                message: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Failed to notify property agent'
            });
        }
    }
};
export const recordPropertyView = async (req, res) => {
    try {
        const propertyId = req.params.id;
        if (!propertyId) {
            res.status(400).json({
                success: false,
                message: 'Property ID is required'
            });
            return;
        }
        if (!isValidUuid(propertyId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
            return;
        }
        const result = await propertyFitService.notifyPropertyViewed({
            propertyId,
            contact: req.body?.contact,
            propertyUrl: req.body?.propertyUrl
        }, { sendEmail: false });
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        if (error instanceof AppError) {
            res.status(error.status).json({
                success: false,
                message: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Failed to record property view'
            });
        }
    }
};
export const createOrLoginPropertyFitLead = async (req, res) => {
    try {
        const result = await propertyFitService.createOrLoginPropertyFitLead(req.body.contact);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        if (error instanceof AppError) {
            res.status(error.status).json({
                success: false,
                message: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Failed to create property fit lead'
            });
        }
    }
};
//# sourceMappingURL=propertyController.js.map