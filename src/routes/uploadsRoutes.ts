import { Router } from 'express';
import * as imageUploadController from '../controllers/imageUploadController.js';
import { upload } from '../services/imageUploadService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
// Upload multiple images
router.post(
  '/',
  authenticateToken,
  upload.array('files'),
  imageUploadController.uploadImages
);

export default router;
