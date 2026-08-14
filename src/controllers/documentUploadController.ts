import { Request, Response } from 'express';
import * as s3Service from '../services/s3UploadService.js';

export const uploadDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    if (files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No documents provided'
      });
      return;
    }

    const uploadedDocuments = await Promise.all(
      files.map(async (file) => ({
        url: await s3Service.uploadFileToS3(file, 'documents'),
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size
      }))
    );

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: { documents: uploadedDocuments }
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to upload documents'
    });
  }
};
