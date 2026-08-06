import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile, changePassword, forgotPassword, resetPassword, verifyEmail, verifyOTP } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const ALPHANUMERIC_PASSWORD_REGEX = /^[A-Za-z0-9]{6,}$/;

router.post(
  '/register',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .matches(ALPHANUMERIC_PASSWORD_REGEX)
      .withMessage('Password must be at least 6 characters and contain only letters and numbers')
  ],
  register
);

router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .matches(ALPHANUMERIC_PASSWORD_REGEX)
      .withMessage('Password must be at least 6 characters and contain only letters and numbers')
  ],
  login
);

router.post('/verify-email', verifyEmail);

router.post(
  '/verify-otp',
  [
    body('otp')
      .notEmpty()
      .withMessage('OTP is required')
      .isLength({ min: 6, max: 6 })
      .matches(/^\d{6}$/),

    body('email')
      .optional()
      .isEmail()
      .withMessage('Invalid email address'),

    body('user_id')
      .optional()
      .isUUID()
      .withMessage('Invalid user id')
  ],
  verifyOTP
);
router.get('/profile', authenticateToken, getProfile);

router.put(
  '/profile',
  authenticateToken,
  [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('user_name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('phone_number')
      .optional({ nullable: true })
      .trim()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Invalid phone number format'),
    body('phoneNumber')
      .optional({ nullable: true })
      .trim()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Invalid phone number format')
  ],
  updateProfile
);

const changePasswordValidation = [
  body('oldPassword').optional().notEmpty().withMessage('Old password is required')
    .matches(ALPHANUMERIC_PASSWORD_REGEX).withMessage('Old password must be at least 6 characters and alphanumeric only'),
  body('old_password').optional().notEmpty().withMessage('Old password is required')
    .matches(ALPHANUMERIC_PASSWORD_REGEX).withMessage('Old password must be at least 6 characters and alphanumeric only'),
  body('newPassword').optional()
    .matches(ALPHANUMERIC_PASSWORD_REGEX).withMessage('New password must be at least 6 characters and alphanumeric only'),
  body('new_password').optional()
    .matches(ALPHANUMERIC_PASSWORD_REGEX).withMessage('New password must be at least 6 characters and alphanumeric only'),
];

router.put('/change-password', authenticateToken, changePasswordValidation, changePassword);
router.post('/change-password', authenticateToken, changePasswordValidation, changePassword);

router.post(
  '/forgot-password',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail()
  ],
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .optional()
      .matches(ALPHANUMERIC_PASSWORD_REGEX)
      .withMessage('New password must be at least 6 characters and alphanumeric only'),
    body('new_password')
      .optional()
      .matches(ALPHANUMERIC_PASSWORD_REGEX)
      .withMessage('New password must be at least 6 characters and alphanumeric only')
  ],
  resetPassword
);

export default router;
