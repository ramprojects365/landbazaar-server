import multer from 'multer';
import * as s3Service from './s3UploadService.js';
import { PROPERTY_IMAGE_MIME_TYPES, validateImageMimeType } from '../utils/imageValidation.js';
// Configure multer for memory storage (files will be uploaded to S3, not disk)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    try {
        validateImageMimeType(file, PROPERTY_IMAGE_MIME_TYPES);
        cb(null, true);
    }
    catch (error) {
        cb(error);
    }
};
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});
export const uploadAny = () => upload.any();
export const uploadSingle = (fieldName = 'images') => upload.single(fieldName);
export const uploadArray = (fieldName = 'images', maxCount = 15) => upload.array(fieldName, maxCount);
export const uploadFields = (fields) => upload.fields(fields);
/**
 * Upload single image to S3
 */
export const uploadToSpaces = async (file, folder = 'properties') => {
    return await s3Service.uploadImageToS3(file, folder);
};
/**
 * Upload multiple images to S3
 */
export const uploadMultipleToSpaces = async (files, folder = 'properties') => {
    return await s3Service.uploadMultipleImagesToS3(files, folder);
};
/**
 * Delete single image from S3
 */
export const deleteFromSpaces = async (fileUrl) => {
    return await s3Service.deleteImageFromS3(fileUrl);
};
/**
 * Delete multiple images from S3
 */
export const deleteMultipleFromSpaces = async (fileUrls) => {
    return await s3Service.deleteMultipleImagesFromS3(fileUrls);
};
//# sourceMappingURL=imageUploadService.js.map