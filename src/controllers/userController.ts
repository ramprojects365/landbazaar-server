import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as authService from '../services/authService.js';
import * as userRepository from '../repositories/userRepository.js';
import * as s3Service from '../services/s3UploadService.js';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await authService.getUserProfile(req.user!.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    // Map frontend field names → DB field names
    const { fullName, aboutYou, companyName, icPassport, designation, experience, renNumber, ren_number, username: usernameField, user_name, phoneNumber, phone_number } = req.body;
    const username = usernameField ?? user_name;
    const phone = phoneNumber ?? phone_number;
    const ren = renNumber ?? ren_number;

    const updates: Record<string, any> = {};
    if (fullName !== undefined)    updates.fullName = fullName || null;
    if (aboutYou !== undefined)    updates.bio = aboutYou || null;
    if (companyName !== undefined) updates.companyName = companyName || null;
    if (icPassport !== undefined)  updates.icPassport = icPassport || null;
    if (designation !== undefined) updates.designation = designation || null;
    if (experience !== undefined)  updates.experienceYears = experience ? Number(experience) : null;
    if (ren !== undefined)         updates.renNumber = ren || null;
    if (username !== undefined)    updates.username = username;
    if (phone !== undefined)       updates.phoneNumber = phone || null;

    const user = await authService.updateUserProfile(req.user!.id, updates);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const uploadProfileImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file as Express.Multer.File;

    if (!file) {
      res.status(400).json({ success: false, message: 'No image provided' });
      return;
    }

    // Upload to S3
    const imageUrl = await s3Service.uploadImageToS3(file, 'avatars');

    // Delete old profile image from S3 if it exists
    const oldImageUrl = await userRepository.getProfileImage(req.user!.id);
    if (oldImageUrl) {
      try {
        await s3Service.deleteImageFromS3(oldImageUrl);
      } catch (error) {
        console.warn('Failed to delete old profile image:', error);
        // Don't fail the upload if old image deletion fails
      }
    }

    const user = await authService.uploadProfileImage(req.user!.id, imageUrl);

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: { user }
    });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    console.error('Profile image upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};
