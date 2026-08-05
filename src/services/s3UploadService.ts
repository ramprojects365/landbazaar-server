import AWS from 'aws-sdk';
import crypto from 'crypto';
import sharp from 'sharp';
import { validateImageFile } from '../utils/imageValidation.js';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL;

const MAX_IMAGES = 15;
let warnedMissingS3Config = false;

interface UploadParams {
  Bucket: string;
  Key: string;
  Body: Buffer;
  ContentType: string;
}

const getBucketName = (): string => {
  if (!BUCKET_NAME) {
    if (!warnedMissingS3Config) {
      console.warn('S3 upload is not configured. Set AWS_S3_BUCKET_NAME to enable image upload.');
      warnedMissingS3Config = true;
    }

    throw new Error('Image upload is not configured on this server. Please set AWS_S3_BUCKET_NAME.');
  }

  return BUCKET_NAME;
};

/**
 * Generate a unique file identifier
 */
const generateUniqueIdentifier = (): string => {
  return crypto.randomBytes(8).toString('hex');
};

/**
 * Convert image buffer to WebP
 */
const convertToWebP = async (file: Express.Multer.File): Promise<Buffer> => {
  return sharp(file.buffer)
    .rotate()
    .resize({
      width: 1200,
      withoutEnlargement: true
    })
    .webp({
      quality: 80
    })
    .toBuffer();
};

/**
 * Build public image URL
 */
const buildImageUrl = (key: string, bucketName: string): string => {
  const publicBaseUrl =
    AWS_CLOUDFRONT_URL ||
    `https://${bucketName}.s3.${AWS_REGION}.amazonaws.com`;

  return `${publicBaseUrl.replace(/\/$/, '')}/${key}`;
};

const uploadValidatedImageToS3 = async (
  file: Express.Multer.File,
  folderPath: string = 'uploads'
): Promise<string> => {
  const bucketName = getBucketName();
  const timestamp = Date.now();
  const uniqueId = generateUniqueIdentifier();
  // Always save as .webp
  const key = `${folderPath}/${timestamp}-${uniqueId}.webp`;
  try {
    const webpBuffer = await convertToWebP(file);

    const params: UploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: webpBuffer,
      ContentType: 'image/webp'
    };

    await s3.upload(params).promise();
    return buildImageUrl(key, bucketName);
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload image to S3: ${error}`);
  }
};

/**
 * Upload a single image to S3 as WebP
 */
export const uploadImageToS3 = async (
  file: Express.Multer.File,
  folderPath: string = 'uploads'
): Promise<string> => {
  await validateImageFile(file);
  return uploadValidatedImageToS3(file, folderPath);
};

/**
 * Upload multiple images to S3 as WebP
 */
export const uploadMultipleImagesToS3 = async (
  files: Express.Multer.File[],
  folderPath: string = 'uploads'
): Promise<string[]> => {
  if (files.length > MAX_IMAGES) {
    throw new Error(`Maximum ${MAX_IMAGES} images allowed`);
  }

  await Promise.all(files.map(file => validateImageFile(file)));

  try {
    const uploadPromises = files.map(file => uploadValidatedImageToS3(file, folderPath));
    return await Promise.all(uploadPromises);
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error;
    }

    console.error('Bulk S3 upload error:', error);
    throw new Error(`Failed to upload images to S3: ${error}`);
  }
};

/**
 * Extract S3 key from image URL
 */
const extractKeyFromUrl = (imageUrl: string): string => {
  const urlParts = new URL(imageUrl);
  return decodeURIComponent(urlParts.pathname.substring(1));
};

/**
 * Delete a single image from S3
 */
export const deleteImageFromS3 = async (imageUrl: string): Promise<void> => {
  try {
    const bucketName = getBucketName();
    const key = extractKeyFromUrl(imageUrl);

    const params = {
      Bucket: bucketName,
      Key: key
    };

    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error(`Failed to delete image from S3: ${error}`);
  }
};

/**
 * Delete multiple images from S3
 */
export const deleteMultipleImagesFromS3 = async (
  imageUrls: string[]
): Promise<void> => {
  try {
    const deletePromises = imageUrls.map(url => deleteImageFromS3(url));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Bulk S3 delete error:', error);
    throw new Error(`Failed to delete images from S3: ${error}`);
  }
};

/**
 * Get S3 signed URL for private files
 */
export const getSignedUrl = async (
  imageUrl: string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    const bucketName = getBucketName();
    const key = extractKeyFromUrl(imageUrl);

    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: key,
      Expires: expiresIn
    });

    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error(`Failed to generate signed URL: ${error}`);
  }
};
