import * as propertyRepository from '../repositories/propertyRepository.js';
import * as engagementRepository from '../repositories/propertyEngagementRepository.js';
import * as notificationService from './notificationService.js';
import { sendPropertyFavouriteNotificationEmail } from './emailService.js';
import { AppError } from '../utils/errors.js';

const getDisplayName = (user: { fullName?: string | null; username?: string | null; email?: string } | undefined) =>
  user?.fullName?.trim() || user?.username?.trim() || user?.email?.split('@')[0] || 'A Dekho Land user';

export const saveProperty = async (propertyId: string, userId: string, propertyUrl?: string) => {
  const property = await propertyRepository.findPropertyById(propertyId);
  if (!property) throw new AppError('Property not found', 404);
  if (property.userId === userId) throw new AppError('You cannot save your own property', 400);

  const existing = await engagementRepository.findFavourite(propertyId, userId);
  if (existing) {
    return { saved: true, created: false, favourite: existing };
  }

  const favourite = await engagementRepository.createFavourite(propertyId, userId);
  const buyer = await engagementRepository.findFavourite(propertyId, userId);
  const buyerName = getDisplayName(buyer?.user);
  const propertyTitle = property.propertyName || property.title;

  await notificationService.createPropertyFavouriteNotification({
    property,
    viewerName: buyerName,
    viewerEmail: buyer?.user?.email,
    viewerPhone: buyer?.user?.phoneNumber || undefined,
    propertyUrl
  });

  if (property.user?.email) {
    try {
      await sendPropertyFavouriteNotificationEmail({
        to: property.user.email,
        sellerName: property.user.fullName || property.user.username,
        buyerName,
        buyerEmail: buyer?.user?.email,
        buyerPhone: buyer?.user?.phoneNumber || undefined,
        propertyTitle,
        propertyUrl
      });
    } catch (error) {
      console.error('Failed to send property favourite notification:', error);
    }
  }

  return { saved: true, created: true, favourite };
};

export const removeSavedProperty = async (propertyId: string, userId: string) => ({
  saved: !(await engagementRepository.removeFavourite(propertyId, userId))
});

export const getSavedProperties = async (userId: string) => {
  const favourites = await engagementRepository.findFavouritesByUserId(userId);
  return favourites.map((favourite) => ({ ...favourite.property, savedAt: favourite.createdAt }));
};

export const getSavedStatus = async (propertyId: string, userId: string) => ({
  saved: Boolean(await engagementRepository.findFavourite(propertyId, userId))
});