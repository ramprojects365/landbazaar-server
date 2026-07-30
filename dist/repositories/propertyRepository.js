import { AppDataSource } from '../config/database.js';
import { Property } from '../entities/Property.js';
import { AppError } from '../utils/errors.js';
export const createProperty = async (propertyData) => {
    const propertyRepository = AppDataSource.getRepository(Property);
    const property = propertyRepository.create(propertyData);
    const savedProperty = await propertyRepository.save(property);
    const propertyWithUser = await findPropertyById(savedProperty.id);
    if (!propertyWithUser) {
        throw new AppError('Failed to load property after creation', 500);
    }
    return propertyWithUser;
};
export const findDuplicateProperty = async (match) => {
    const propertyRepository = AppDataSource.getRepository(Property);
    return await propertyRepository
        .createQueryBuilder('property')
        .where('LOWER(TRIM(property.propertyName)) = LOWER(TRIM(:propertyName))', {
        propertyName: match.propertyName
    })
        .andWhere('LOWER(TRIM(property.streetName)) = LOWER(TRIM(:streetName))', {
        streetName: match.streetName
    })
        .andWhere('LOWER(TRIM(property.cityName)) = LOWER(TRIM(:cityName))', {
        cityName: match.cityName
    })
        .andWhere('LOWER(TRIM(property.state)) = LOWER(TRIM(:state))', {
        state: match.state
    })
        .getOne();
};
export const findPropertyById = async (id) => {
    const propertyRepository = AppDataSource.getRepository(Property);
    return await propertyRepository.findOne({
        where: { id },
        relations: ['user']
    });
};
export const findAllProperties = async (filters) => {
    const propertyRepository = AppDataSource.getRepository(Property);
    const queryBuilder = propertyRepository.createQueryBuilder('property');
    queryBuilder.leftJoinAndSelect('property.user', 'user');
    // Default to active status if not specified
    const statusFilter = filters?.status !== undefined ? filters.status : 'active';
    queryBuilder.andWhere('property.status = :status', { status: statusFilter });
    if (filters) {
        if (filters.listingType) {
            queryBuilder.andWhere('property.listingType = :listingType', {
                listingType: filters.listingType
            });
        }
        if (filters.propertyType) {
            queryBuilder.andWhere('property.propertyType = :propertyType', {
                propertyType: filters.propertyType
            });
        }
        if (filters.tenure) {
            queryBuilder.andWhere('property.tenure = :tenure', { tenure: filters.tenure });
        }
        if (filters.furnishing) {
            queryBuilder.andWhere('property.furnishing = :furnishing', {
                furnishing: filters.furnishing
            });
        }
        if (filters.availability) {
            queryBuilder.andWhere('property.availability = :availability', {
                availability: filters.availability
            });
        }
        if (filters.cityName) {
            queryBuilder.andWhere('(property.cityName ILIKE :location OR property.state ILIKE :location OR property.streetName ILIKE :location OR property.landmark ILIKE :location OR property.propertyName ILIKE :location)', { location: `%${filters.cityName}%` });
        }
        if (filters.state) {
            queryBuilder.andWhere('property.state ILIKE :state', {
                state: `%${filters.state}%`
            });
        }
        if (filters.userId) {
            queryBuilder.andWhere('property.userId = :userId', { userId: filters.userId });
        }
        if (filters.minPrice !== undefined) {
            queryBuilder.andWhere('property.price >= :minPrice', { minPrice: filters.minPrice });
        }
        if (filters.maxPrice !== undefined) {
            queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice: filters.maxPrice });
        }
        if (filters.minBedrooms !== undefined) {
            queryBuilder.andWhere('property.bedrooms >= :minBedrooms', {
                minBedrooms: filters.minBedrooms
            });
        }
        if (filters.maxBedrooms !== undefined) {
            queryBuilder.andWhere('property.bedrooms <= :maxBedrooms', {
                maxBedrooms: filters.maxBedrooms
            });
        }
        if (filters.minBathrooms !== undefined) {
            queryBuilder.andWhere('property.bathrooms >= :minBathrooms', {
                minBathrooms: filters.minBathrooms
            });
        }
        if (filters.minArea !== undefined) {
            queryBuilder.andWhere('property.buildupArea >= :minArea', { minArea: filters.minArea });
        }
        if (filters.negotiable !== undefined) {
            queryBuilder.andWhere('property.negotiable = :negotiable', {
                negotiable: filters.negotiable
            });
        }
        if (filters.swimmingPool !== undefined) {
            queryBuilder.andWhere('property.swimmingPool = :swimmingPool', {
                swimmingPool: filters.swimmingPool
            });
        }
        if (filters.gymnasium !== undefined) {
            queryBuilder.andWhere('property.gymnasium = :gymnasium', {
                gymnasium: filters.gymnasium
            });
        }
        if (filters.coveredParking !== undefined) {
            queryBuilder.andWhere('property.coveredParking = :coveredParking', {
                coveredParking: filters.coveredParking
            });
        }
        if (filters.security24h !== undefined) {
            queryBuilder.andWhere('property.security24h = :security24h', {
                security24h: filters.security24h
            });
        }
    }
    queryBuilder.orderBy('property.createdAt', 'DESC');
    return await queryBuilder.getMany();
};
export const findPropertiesByUserId = async (userId) => {
    const propertyRepository = AppDataSource.getRepository(Property);
    return await propertyRepository.find({
        where: { userId, status: 'active' },
        order: { createdAt: 'DESC' },
        relations: ['user']
    });
};
export const updateProperty = async (id, updates) => {
    const propertyRepository = AppDataSource.getRepository(Property);
    await propertyRepository.update(id, updates);
    return await findPropertyById(id);
};
export const deleteProperty = async (id) => {
    const propertyRepository = AppDataSource.getRepository(Property);
    await propertyRepository.delete(id);
};
export const searchProperties = async (filters) => {
    const propertyRepository = AppDataSource.getRepository(Property);
    const queryBuilder = propertyRepository.createQueryBuilder('property');
    queryBuilder.leftJoinAndSelect('property.user', 'user');
    const conditions = [];
    const params = {};
    // Default to active status
    conditions.push('property.status = :status');
    params.status = 'active';
    if (filters.q) {
        conditions.push('(property.title ILIKE :q OR ' +
            'property.description ILIKE :q OR ' +
            'property.cityName ILIKE :q OR ' +
            'property.streetName ILIKE :q OR ' +
            'property.landmark ILIKE :q OR ' +
            'property.propertyName ILIKE :q OR ' +
            'property.state ILIKE :q)');
        params.q = `%${filters.q}%`;
    }
    if (filters.type) {
        if (filters.type == "buy") {
            filters.type = "sale";
        }
        conditions.push('LOWER(property.listingType) = LOWER(:type)');
        params.type = filters.type;
    }
    if (filters.city) {
        conditions.push('property.cityName ILIKE :city');
        params.city = `%${filters.city}%`;
    }
    if (filters.propertyName) {
        conditions.push('(property.title ILIKE :propertyName OR property.propertyName ILIKE :propertyName)');
        params.propertyName = `%${filters.propertyName}%`;
    }
    if (conditions.length > 0) {
        queryBuilder.where(conditions.join(' AND '), params);
    }
    queryBuilder.orderBy('property.createdAt', 'DESC');
    return await queryBuilder.getMany();
};
export const countPropertiesByUser = async (userId) => {
    const propertyRepository = AppDataSource.getRepository(Property);
    return await propertyRepository.count({
        where: { userId, status: 'active' }
    });
};
//# sourceMappingURL=propertyRepository.js.map