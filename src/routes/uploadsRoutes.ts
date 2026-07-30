import { Router } from 'express';
import * as imageUploadController from '../controllers/imageUploadController.js';
import { upload } from '../services/imageUploadService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const MAX_IMAGES = 15;

// Upload multiple images
router.post(
  '/',
  authenticateToken,
  upload.array('files', MAX_IMAGES),
  imageUploadController.uploadImages
);

export default router;
