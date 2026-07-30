import { Router } from 'express';
import * as imageUploadController from '../controllers/imageUploadController.js';
import { upload } from '../services/imageUploadService.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
const MAX_IMAGES = 15;
router.post('/upload-multiple', authenticateToken, upload.array('images', MAX_IMAGES), imageUploadController.uploadImages);
router.post('/upload-single', upload.single('images'), imageUploadController.uploadSingleImage);
router.delete('/delete', authenticateToken, imageUploadController.deleteImage);
export default router;
//# sourceMappingURL=imageUploadRoutes.js.map