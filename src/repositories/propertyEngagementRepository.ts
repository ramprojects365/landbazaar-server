import { AppDataSource } from '../config/database.js';
import { PropertyFavourite } from '../entities/PropertyFavourite.js';
import { PropertyView } from '../entities/PropertyView.js';
import { Notification } from '../entities/Notification.js';

export type PropertyEngagementStats = {
  viewCount: number;
  uniqueViewCount: number;
  favouriteCount: number;
  leadCount: number;
};

const getUtcDate = (): string => new Date().toISOString().slice(0, 10);

export const recordPropertyView = async (input: {
  propertyId: string;
  viewerId?: string;
  visitorKey?: string;
}): Promise<{ recorded: boolean; viewDate: string }> => {
  const viewDate = getUtcDate();
  const repository = AppDataSource.getRepository(PropertyView);
  const where = input.viewerId
    ? { propertyId: input.propertyId, viewerId: input.viewerId, viewDate }
    : { propertyId: input.propertyId, visitorKey: input.visitorKey, viewDate };

  const existing = await repository.findOne({ where });
  if (existing) {
    return { recorded: false, viewDate };
  }

  await repository.save(
    repository.create({
      propertyId: input.propertyId,
      viewerId: input.viewerId || null,
      visitorKey: input.viewerId ? null : input.visitorKey || null,
      viewDate
    })
  );

  return { recorded: true, viewDate };
};

export const getPropertyEngagementStats = async (
  propertyId: string
): Promise<PropertyEngagementStats> => {
  const viewRepository = AppDataSource.getRepository(PropertyView);
  const favouriteRepository = AppDataSource.getRepository(PropertyFavourite);
  const notificationRepository = AppDataSource.getRepository(Notification);

  const viewStats = await viewRepository
    .createQueryBuilder('view')
    .select('COUNT(view.id)', 'viewCount')
    .addSelect(
      "COUNT(DISTINCT COALESCE(view.viewer_id::text, 'anonymous:' || view.visitor_key))",
      'uniqueViewCount'
    )
    .where('view.property_id = :propertyId', { propertyId })
    .getRawOne<{ viewCount: string; uniqueViewCount: string }>();

  const favouriteCount = await favouriteRepository.count({ where: { propertyId } });
  const leadStats = await notificationRepository
    .createQueryBuilder('notification')
    .select(
      "COUNT(DISTINCT COALESCE(notification.actor_email, notification.actor_phone, notification.actor_name))",
      'leadCount'
    )
    .where('notification.property_id = :propertyId', { propertyId })
    .andWhere('notification.type IN (:...leadTypes)', {
      leadTypes: ['property_view', 'property_fit_match', 'property_favourite']
    })
    .andWhere('(notification.actor_email IS NOT NULL OR notification.actor_phone IS NOT NULL)')
    .getRawOne<{ leadCount: string }>();

  return {
    viewCount: Number(viewStats?.viewCount || 0),
    uniqueViewCount: Number(viewStats?.uniqueViewCount || 0),
    favouriteCount,
    leadCount: Number(leadStats?.leadCount || 0)
  };
};

export const getPropertyEngagementStatsForProperties = async (
  propertyIds: string[]
): Promise<Map<string, PropertyEngagementStats>> => {
  const stats = new Map<string, PropertyEngagementStats>();
  await Promise.all(
    propertyIds.map(async (propertyId) => {
      stats.set(propertyId, await getPropertyEngagementStats(propertyId));
    })
  );
  return stats;
};

export const findFavourite = async (propertyId: string, userId: string) => {
  return await AppDataSource.getRepository(PropertyFavourite).findOne({
    where: { propertyId, userId },
    relations: ['property', 'property.user', 'user']
  });
};

export const createFavourite = async (propertyId: string, userId: string) => {
  const repository = AppDataSource.getRepository(PropertyFavourite);
  return await repository.save(repository.create({ propertyId, userId }));
};

export const removeFavourite = async (propertyId: string, userId: string): Promise<boolean> => {
  const result = await AppDataSource.getRepository(PropertyFavourite).delete({ propertyId, userId });
  return (result.affected ?? 0) > 0;
};

export const findFavouritesByUserId = async (userId: string) => {
  return await AppDataSource.getRepository(PropertyFavourite).find({
    where: { userId, property: { status: 'active' } },
    relations: ['property', 'property.user'],
    order: { createdAt: 'DESC' }
  });
};
