import { Request, Response } from 'express';
import * as imageUploadService from '../services/imageUploadService.js';

export const uploadImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No images provided'
      });
      return;
    }

    const imageUrls = await imageUploadService.uploadMultipleToSpaces(files);

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        imageUrls
      }
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to upload images'
    });
  }
};

export const uploadSingleImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file as Express.Multer.File;

    if (!file) {
      res.status(400).json({
        success: false,
        message: 'No image provided'
      });
      return;
    }

    const media = await imageUploadService.uploadMedia(file);

    res.status(200).json({
      success: true,
      message: `${media.mediaType === 'video' ? 'Video' : 'Image'} uploaded successfully`,
      data: {
        imageUrl: media.url,
        url: media.url,
        mediaType: media.mediaType,
        fileName: file.originalname
      }
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to upload media file'
    });
  }
};

export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
      return;
    }

    await imageUploadService.deleteFromSpaces(imageUrl);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete image'
    });
  }
};
