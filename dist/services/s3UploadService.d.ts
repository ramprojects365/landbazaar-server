/**
 * Upload a single image to S3 as WebP
 */
export declare const uploadImageToS3: (file: Express.Multer.File, folderPath?: string) => Promise<string>;
/**
 * Upload multiple images to S3 as WebP
 */
export declare const uploadMultipleImagesToS3: (files: Express.Multer.File[], folderPath?: string) => Promise<string[]>;
/**
 * Delete a single image from S3
 */
export declare const deleteImageFromS3: (imageUrl: string) => Promise<void>;
/**
 * Delete multiple images from S3
 */
export declare const deleteMultipleImagesFromS3: (imageUrls: string[]) => Promise<void>;
/**
 * Get S3 signed URL for private files
 */
export declare const getSignedUrl: (imageUrl: string, expiresIn?: number) => Promise<string>;
//# sourceMappingURL=s3UploadService.d.ts.map