import { Router } from 'express';
import multer from 'multer';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { uploadProfileImage, getProfile, updateProfile } from '../controllers/userController.js';

// Use memory storage since files will be uploaded to S3
const avatarStorage = multer.memoryStorage();

const avatarUpload = multer({
  storage: avatarStorage
});

const router = Router();

router.get('/profile', authenticateToken, getProfile);

const profileValidation = [
  body('fullName').optional({ nullable: true }).trim(),
  body('aboutYou').optional({ nullable: true }).trim(),
  body('companyName').optional({ nullable: true }).trim(),
  body('icPassport').optional({ nullable: true }).trim(),
  body('designation').optional({ nullable: true }).trim(),
  body('experience').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('username').optional().trim().isLength({ min: 2, max: 60 }).withMessage('Username must be between 2 and 60 characters'),
  body('user_name').optional().trim().isLength({ min: 2, max: 60 }).withMessage('Username must be between 2 and 60 characters'),
  body('phoneNumber').optional({ nullable: true }).trim(),
  body('phone_number').optional({ nullable: true }).trim()
];

router.put('/profile', authenticateToken, profileValidation, updateProfile);
router.patch('/profile', authenticateToken, profileValidation, updateProfile);

router.post(
  '/profile/image',
  authenticateToken,
  avatarUpload.single('profileImage'),
  uploadProfileImage
);

export default router;
