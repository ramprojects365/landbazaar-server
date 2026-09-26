import multer from 'multer';
import * as s3Service from './s3UploadService.js';

// Configure multer for memory storage with up to 50MB to support photos and videos
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

export const isVideoFile = (file: Express.Multer.File): boolean => {
  if (file.mimetype && file.mimetype.toLowerCase().startsWith('video/')) {
    return true;
  }
  return /\.(mp4|webm|mov|m4v|ogg)$/i.test(file.originalname);
};

export const uploadAny = () => upload.any();
export const uploadSingle = (fieldName: string = 'images') => upload.single(fieldName);
export const uploadArray = (fieldName: string = 'images') => upload.array(fieldName);
export const uploadFields = (fields: multer.Field[]) => upload.fields(fields);

/**
 * Upload single media (image or video) to S3 / storage
 */
export const uploadMedia = async (
  file: Express.Multer.File,
  folder: string = 'properties'
): Promise<{ url: string; mediaType: 'image' | 'video' }> => {
  if (isVideoFile(file)) {
    const url = await s3Service.uploadFileToS3(file, `${folder}/videos`);
    return { url, mediaType: 'video' };
  }

  const url = await s3Service.uploadImageToS3(file, folder);
  return { url, mediaType: 'image' };
};

/**
 * Upload single image to S3 (kept for backward compatibility, automatically handles video as well)
 */
export const uploadToSpaces = async (
  file: Express.Multer.File,
  folder: string = 'properties'
): Promise<string> => {
  const result = await uploadMedia(file, folder);
  return result.url;
};

/**
 * Upload multiple images or videos to S3
 */
export const uploadMultipleToSpaces = async (
  files: Express.Multer.File[],
  folder: string = 'properties'
): Promise<string[]> => {
  const promises = files.map(file => uploadToSpaces(file, folder));
  return await Promise.all(promises);
};

/**
 * Delete single image from S3
 */
export const deleteFromSpaces = async (fileUrl: string): Promise<void> => {
  return await s3Service.deleteImageFromS3(fileUrl);
};

/**
 * Delete multiple images from S3
 */
export const deleteMultipleFromSpaces = async (fileUrls: string[]): Promise<void> => {
  return await s3Service.deleteMultipleImagesFromS3(fileUrls);
};
