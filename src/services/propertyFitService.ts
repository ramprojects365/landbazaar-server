import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Property } from '../entities/Property.js';
import * as propertyRepository from '../repositories/propertyRepository.js';
import * as userRepository from '../repositories/userRepository.js';
import {
  sendPropertyFitLeadPasswordEmail,
  sendPropertyFitListEmail,
  sendPropertyViewNotificationEmail
} from './emailService.js';
import * as notificationService from './notificationService.js';
import { generateJWTToken } from './authService.js';
import { AppError } from '../utils/errors.js';

type AdvisorAnswers = {
  intent?: 'rent' | 'buy' | '';
  location?: string;
  budgetRange?: string;
  budgetAmount?: string | number;
  bedrooms?: string;
};

type AdvisorContact = {
  name?: string;
  phone?: string;
  email?: string;
};

type PropertyFitRequest = {
  answers?: AdvisorAnswers;
  contact?: AdvisorContact;
};

type PropertyViewRequest = {
  propertyId?: string;
  contact?: AdvisorContact;
  propertyUrl?: string;
};

type EmailDeliveryStatus = {
  attempted: boolean;
  passwordEmailSent: boolean;
  resultsEmailSent: boolean;
  error?: string;
};

const DEFAULT_PASSWORD_LENGTH = 18;
const DEFAULT_MATCH_LIMIT = 12;
const EMAIL_PATTERN = /^[^\s@]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const NAME_PATTERN = /^(?![0-9])(?=.*[A-Za-z])[A-Za-z\s.'-]{2,60}$/;

const clean = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

const normalizeMalaysiaPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');

  if (digits.startsWith('60')) return `0${digits.slice(2)}`;
  return digits;
};

const isValidMalaysiaPhone = (value: string): boolean => {
  const normalized = normalizeMalaysiaPhone(value);

  return /^0(?:1(?:1\d{8}|[02-46-9]\d{7,8})|3\d{8}|[4-9]\d{7,8})$/.test(normalized);
};

const validateContact = (contact?: AdvisorContact): void => {
  if (!contact) return;

  const email = clean(contact.email);
  const phone = clean(contact.phone);
  const hasAnyContact = Boolean(email || phone);

  if (hasAnyContact && !phone) {
    throw new AppError('Enter your phone number', 400);
  }

  if (hasAnyContact && !email) {
    throw new AppError('Enter your email address', 400);
  }

  if (email && !EMAIL_PATTERN.test(email)) {
    throw new AppError('Enter a valid email address', 400);
  }

  if (phone && !isValidMalaysiaPhone(phone)) {
    throw new AppError('Enter a valid phone number', 400);
  }
};

const parseBedrooms = (value?: string): number | undefined => {
  const parsed = parseInt(clean(value), 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseBudget = (value?: string): { minPrice?: number; maxPrice?: number } => {
  const budget = clean(value).toLowerCase();

  if (!budget) return {};
  if (budget.includes('below') && budget.includes('500')) return { maxPrice: 500000 };
  if (budget.includes('500') && budget.includes('800')) return { minPrice: 500000, maxPrice: 800000 };
  if (budget.includes('800') && budget.includes('1.2')) return { minPrice: 800000, maxPrice: 1200000 };
  if (budget.includes('1.2')) return { minPrice: 1200000 };

  return {};
};

const parseBudgetAmount = (value?: string | number): number | undefined => {
  const amount = typeof value === 'number'
    ? value
    : Number(clean(value).replace(/[^\d.]/g, ''));

  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
};

const buildLocation = (property: Property): string => {
  return [
    property.propertyName,
    property.streetName,
    property.cityName,
    property.state
  ].filter(Boolean).join(', ');
};

const buildPropertyUrl = (propertyId: string): string | undefined => {
  const clientUrl = process.env.PUBLIC_CLIENT_URL || process.env.CLIENT_URL;
  if (!clientUrl) return undefined;

  return `${clientUrl.replace(/\/$/, '')}/property-details/${propertyId}`;
};

const getPropertyImageUrl = (property: Property): string | undefined => {
  const images = property.images;
  if (!Array.isArray(images) || images.length === 0) {
    return undefined;
  }

  const cover = images.find(
    (image) => image && typeof image === 'object' && !Array.isArray(image) && Boolean((image as { isCover?: boolean }).isCover)
  );
  const image = cover || images[0];

  if (typeof image === 'string') {
    return image;
  }

  if (image && typeof image === 'object' && !Array.isArray(image)) {
    const item = image as { url?: string; imageUrl?: string; src?: string };
    return item.url || item.imageUrl || item.src;
  }

  return undefined;
};

const mapPropertiesForEmail = (properties: Property[]) => {
  return properties.map((property) => ({
    title: property.propertyName || property.title || 'PropertyLa listing',
    price: property.price,
    location: buildLocation(property),
    url: buildPropertyUrl(property.id),
    imageUrl: getPropertyImageUrl(property)
  }));
};

const applyLooseFilters = (
  properties: Property[],
  filters: { minBedrooms?: number; maxPrice?: number }
): Property[] => {
  return properties.filter((property) => {
    if (filters.minBedrooms !== undefined && Number(property.bedrooms || 0) < filters.minBedrooms) {
      return false;
    }

    if (filters.maxPrice !== undefined && Number(property.price || 0) > filters.maxPrice) {
      return false;
    }

    return true;
  });
};

const rankClosestProperties = (
  properties: Property[],
  filters: { location?: string; minBedrooms?: number; maxPrice?: number }
): Property[] => {
  const location = clean(filters.location).toLowerCase();

  return [...properties].sort((left, right) => {
    const score = (property: Property): number => {
      let value = 0;
      const propertyLocation = buildLocation(property).toLowerCase();
      const bedrooms = Number(property.bedrooms || 0);
      const price = Number(property.price || 0);

      if (location && propertyLocation.includes(location)) value += 6;
      if (filters.minBedrooms !== undefined) {
        value += bedrooms >= filters.minBedrooms ? 3 : Math.max(0, 2 - (filters.minBedrooms - bedrooms));
      }
      if (filters.maxPrice !== undefined && price > 0) {
        value += price <= filters.maxPrice ? 4 : Math.max(0, 3 - ((price - filters.maxPrice) / filters.maxPrice));
      }

      return value;
    };

    return score(right) - score(left);
  });
};

const getDisplayName = (contact?: AdvisorContact): string => {
  const name = clean(contact?.name);
  return (NAME_PATTERN.test(name) ? name : '') || clean(contact?.email).split('@')[0] || 'Property seeker';
};

const createLeadAccountIfNeeded = async (contact?: AdvisorContact) => {
  const email = clean(contact?.email).toLowerCase();
  const phone = clean(contact?.phone);
  const name = getDisplayName(contact);

  if (!email || !name) {
    return { created: false, user: null };
  }

  const existing = await userRepository.findUserByEmail(email);
  if (existing) {
    return {
      created: false,
      user: existing,
      token: null,
      existingEmail: true
    };
  }

  const password = crypto.randomBytes(DEFAULT_PASSWORD_LENGTH).toString('base64url');
  const passwordHash = await bcrypt.hash(password, 10);
  const usernameBase = email.split('@')[0]?.replace(/[^a-z0-9_]/gi, '').toLowerCase() || 'lead';
  const username = `${usernameBase.slice(0, 22)}_${crypto.randomBytes(3).toString('hex')}`;

  const user = await userRepository.createUser({
    username,
    email,
    phoneNumber: phone,
    userType: 'lead',
    passwordHash,
    verificationToken: crypto.randomBytes(32).toString('hex'),
    verificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    otp: String(crypto.randomInt(100000, 999999))
  });

  await userRepository.updateUser(user.id, {
    fullName: name,
    userType: 'lead',
    phoneNumber: phone
  });

  const verifiedUser = await userRepository.updateUserEmailVerification(user.id);

  return {
    created: true,
    user: verifiedUser,
    token: generateJWTToken(verifiedUser.id, verifiedUser.email),
    password
  };
};

const sendLeadAccountEmail = async (params: {
  email: string;
  name: string;
  password?: string;
}) => {
  try {
    if (params.password) {
      await sendPropertyFitLeadPasswordEmail({
        to: params.email,
        name: params.name,
        password: params.password
      });
      return;
    }
  } catch (error) {
    console.error('Failed to send property fit lead email:', error);
  }
};

const sendPropertyFitMatchEmail = async (params: {
  email: string;
  name: string;
  properties: Property[];
  password?: string;
}): Promise<EmailDeliveryStatus> => {
  const status: EmailDeliveryStatus = {
    attempted: true,
    passwordEmailSent: false,
    resultsEmailSent: false
  };

  try {
    if (params.password) {
      await sendPropertyFitLeadPasswordEmail({
        to: params.email,
        name: params.name,
        password: params.password
      });
      status.passwordEmailSent = true;
    }

    await sendPropertyFitListEmail(
      params.email,
      params.name,
      mapPropertiesForEmail(params.properties)
    );
    status.resultsEmailSent = true;
  } catch (error) {
    console.error('Failed to send property fit match email:', error);
    status.error = error instanceof Error ? error.message : 'Failed to send property fit email';
  }

  return status;
};

export const getPropertyFitMatches = async (request: PropertyFitRequest) => {
  validateContact(request.contact);

  const answers = request.answers || {};
  const maxPrice = parseBudgetAmount(answers.budgetAmount);
  const filters = {
    listingType: answers.intent === 'buy' ? 'sale' as const : answers.intent || undefined,
    cityName: clean(answers.location) || undefined,
    minBedrooms: parseBedrooms(answers.bedrooms),
    ...(maxPrice ? { maxPrice } : parseBudget(answers.budgetRange))
  };

  let properties = await propertyRepository.findAllProperties(filters);

  if (properties.length === 0 && clean(answers.location)) {
    const searched = await propertyRepository.searchProperties({
      q: clean(answers.location),
      type: filters.listingType
    });
    properties = applyLooseFilters(searched, {
      minBedrooms: filters.minBedrooms,
      maxPrice: filters.maxPrice
    });
  }

  if (properties.length === 0 && !clean(answers.location)) {
    properties = await propertyRepository.findAllProperties({
      listingType: filters.listingType,
      minBedrooms: filters.minBedrooms,
      maxPrice: filters.maxPrice
    });
  }

  const exactMatchCount = properties.length;
  let fallbackUsed = false;

  if (properties.length === 0 && filters.listingType) {
    const sameListingType = await propertyRepository.findAllProperties({
      listingType: filters.listingType
    });
    properties = rankClosestProperties(sameListingType, {
      location: answers.location,
      minBedrooms: filters.minBedrooms,
      maxPrice: filters.maxPrice
    });
    fallbackUsed = properties.length > 0;
  }

  const limited = properties.slice(0, DEFAULT_MATCH_LIMIT);
  const lead = await createLeadAccountIfNeeded(request.contact);
  const email = clean(request.contact?.email).toLowerCase();
  let emailDelivery: EmailDeliveryStatus = {
    attempted: false,
    passwordEmailSent: false,
    resultsEmailSent: false
  };

  if (email) {
    emailDelivery = await sendPropertyFitMatchEmail({
      email,
      name: getDisplayName(request.contact),
      properties: limited,
      password: lead.created ? lead.password : undefined
    });
  }

  const agentNotificationResults = await Promise.allSettled(
    limited.map((property) =>
      notificationService.createPropertyFitMatchNotification({
        property,
        viewerName: getDisplayName(request.contact),
        viewerEmail: clean(request.contact?.email),
        viewerPhone: clean(request.contact?.phone),
        propertyUrl: buildPropertyUrl(property.id),
        intent: answers.intent,
        location: answers.location,
        budgetAmount: answers.budgetAmount,
        bedrooms: answers.bedrooms
      })
    )
  );

  const agentNotificationCount = agentNotificationResults.filter(
    (result) => result.status === 'fulfilled' && Boolean(result.value)
  ).length;

  return {
    autoRegistered: lead.created,
    autoLoggedIn: Boolean(lead.created && lead.token),
    existingEmailIgnored: Boolean(lead.existingEmail),
    defaultPassword: lead.created ? lead.password : undefined,
    fallbackUsed,
    exactMatchCount,
    auth: lead.created && lead.token && lead.user ? {
      token: lead.token,
      user: {
        id: lead.user.id,
        username: lead.user.username,
        email: lead.user.email,
        phoneNumber: lead.user.phoneNumber,
        userType: lead.user.userType,
        fullName: lead.user.fullName || getDisplayName(request.contact),
        emailVerified: lead.user.emailVerified
      }
    } : null,
    leadUserId: lead.user?.id,
    emailDelivery,
    agentNotificationCount,
    count: limited.length,
    data: limited
  };
};

export const notifyPropertyViewed = async (
  request: PropertyViewRequest,
  options: { sendEmail?: boolean } = {}
) => {
  validateContact(request.contact);

  const propertyId = clean(request.propertyId);
  if (!propertyId) {
    throw new AppError('Property ID is required', 400);
  }

  const property = await propertyRepository.findPropertyById(propertyId);
  if (!property) {
    throw new AppError('Property not found', 404);
  }

  await createLeadAccountIfNeeded(request.contact);

  const notification = await notificationService.createPropertyViewNotification({
    propertyId: property.id,
    viewerName: getDisplayName(request.contact),
    viewerEmail: clean(request.contact?.email),
    viewerPhone: clean(request.contact?.phone),
    propertyUrl: request.propertyUrl || buildPropertyUrl(property.id)
  });

  const agentEmail = property.user?.email;
  if (!agentEmail) {
    return {
      notified: Boolean(notification),
      notificationId: notification?.id,
      emailSent: false,
      message: 'Property owner notification saved, but no email was available'
    };
  }

  const shouldSendEmail = options.sendEmail ?? true;
  if (shouldSendEmail) {
    try {
      await sendPropertyViewNotificationEmail({
        to: agentEmail,
        agentName: property.user?.fullName || property.user?.username,
        leadName: getDisplayName(request.contact),
        leadEmail: clean(request.contact?.email),
        leadPhone: clean(request.contact?.phone),
        propertyTitle: property.propertyName || property.title,
        propertyUrl: request.propertyUrl || buildPropertyUrl(property.id)
      });
    } catch (error) {
      console.error('Failed to send property view notification:', error);
      throw new AppError('Failed to notify agent', 500);
    }
  }

  return {
    notified: Boolean(notification),
    notificationId: notification?.id,
    emailSent: shouldSendEmail
  };
};

export const createOrLoginPropertyFitLead = async (contact?: AdvisorContact) => {
  validateContact(contact);

  const lead = await createLeadAccountIfNeeded(contact);
  const email = clean(contact?.email).toLowerCase();

  if (email && lead.created) {
    await sendLeadAccountEmail({
      email,
      name: getDisplayName(contact),
      password: lead.password
    });
  }

  return {
    autoRegistered: lead.created,
    autoLoggedIn: Boolean(lead.created && lead.token),
    existingEmailIgnored: Boolean(lead.existingEmail),
    defaultPassword: lead.created ? lead.password : undefined,
    auth: lead.created && lead.token && lead.user ? {
      token: lead.token,
      user: {
        id: lead.user.id,
        username: lead.user.username,
        email: lead.user.email,
        phoneNumber: lead.user.phoneNumber,
        userType: lead.user.userType,
        fullName: lead.user.fullName || getDisplayName(contact),
        emailVerified: lead.user.emailVerified
      }
    } : null
  };
};
