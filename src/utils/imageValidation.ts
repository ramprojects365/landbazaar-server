import sharp from 'sharp';
import { AppError, ValidationError } from './errors.js';

export const IMAGE_UPLOAD_LIMITS = {
  maxFileWeightBytes: 5 * 1024 * 1024,
  maxWidth: 8000,
  maxHeight: 8000
};

export const PROPERTY_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

export const AVATAR_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const MIMETYPE_TO_FORMAT: Record<string, string> = {
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp'
};

interface ImageValidationOptions {
  allowedMimeTypes?: string[];
  maxFileWeightBytes?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const validateImageMimeType = (
  file: Express.Multer.File,
  allowedMimeTypes: string[] = PROPERTY_IMAGE_MIME_TYPES
): void => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new ValidationError(`Invalid image type. Allowed types: ${allowedMimeTypes.join(', ')}.`);
  }
};

export const validateImageFile = async (
  file: Express.Multer.File,
  options: ImageValidationOptions = {}
): Promise<void> => {
  const allowedMimeTypes = options.allowedMimeTypes ?? PROPERTY_IMAGE_MIME_TYPES;
  const maxFileWeightBytes = options.maxFileWeightBytes ?? IMAGE_UPLOAD_LIMITS.maxFileWeightBytes;
  const maxWidth = options.maxWidth ?? IMAGE_UPLOAD_LIMITS.maxWidth;
  const maxHeight = options.maxHeight ?? IMAGE_UPLOAD_LIMITS.maxHeight;

  validateImageMimeType(file, allowedMimeTypes);

  if (file.size > maxFileWeightBytes) {
    throw new AppError(`Image is too large. Maximum allowed file weight is ${formatBytes(maxFileWeightBytes)}.`, 413);
  }

  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(file.buffer, { animated: false }).metadata();
  } catch {
    throw new ValidationError('Invalid image file. The uploaded file could not be decoded as an image.');
  }

  const expectedFormat = MIMETYPE_TO_FORMAT[file.mimetype];
  if (!metadata.format || metadata.format !== expectedFormat) {
    throw new ValidationError('Invalid image type. The file content does not match the uploaded image type.');
  }

  if (!metadata.width || !metadata.height) {
    throw new ValidationError('Invalid image size. Image dimensions could not be detected.');
  }

  if (metadata.width > maxWidth || metadata.height > maxHeight) {
    throw new ValidationError(`Image dimensions are too large. Maximum allowed size is ${maxWidth}x${maxHeight}px.`);
  }
};

const formatBytes = (bytes: number): string => {
  const megabytes = bytes / (1024 * 1024);
  return `${Number.isInteger(megabytes) ? megabytes : megabytes.toFixed(1)}MB`;
};
