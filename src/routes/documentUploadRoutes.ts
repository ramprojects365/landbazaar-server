import { Router } from 'express';
import * as documentUploadController from '../controllers/documentUploadController.js';
import { upload } from '../services/imageUploadService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post(
  '/upload-multiple',
  authenticateToken,
  upload.array('documents'),
  documentUploadController.uploadDocuments
);

export default router;
