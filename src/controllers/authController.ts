import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as authService from '../services/authService.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const {
      email,
      password,
      username,
      phone_number,
      phoneNumber,
      userType,
      user_type,
      renNumber,
      ren_number,
      renStatus,
      ren_status
    } = req.body;

    const result = await authService.registerUser({
      username,
      email,
      phoneNumber: phoneNumber ?? phone_number,
      userType: userType ?? user_type,
      renNumber: renNumber ?? ren_number,
      renStatus: renStatus ?? ren_status,
      password
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. A verification code has been sent to your email.',
      data: result
    });

  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({
        success: false,
        message: error.message
      });
      return;
    }

    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { email, password } = req.body;

    const result = await authService.loginUser({
      email,
      password
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });

  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({
        success: false,
        message: error.message
      });
      return;
    }

    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await authService.getUserProfile(req.user!.id);
    res.status(200).json({
      success: true,
      data: { user }
    });
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

    const {
      username: usernameField,
      user_name,
      phone_number,
      phoneNumber,
      userType,
      user_type,
      renNumber,
      ren_number,
      renStatus,
      ren_status,
      full_name,
      bio,
      company_name,
      ic_passport,
      designation,
      experience_years
    } = req.body;
    const username = usernameField ?? user_name;
    const phone = phone_number ?? phoneNumber;

    const updates: Record<string, any> = {};
    if (username !== undefined) updates.username = username;
    if (phone !== undefined) updates.phoneNumber = phone || null;
    if ((userType ?? user_type) !== undefined) updates.userType = (userType ?? user_type) || null;
    if ((renNumber ?? ren_number) !== undefined) updates.renNumber = (renNumber ?? ren_number) || null;
    if ((renStatus ?? ren_status) !== undefined) updates.renStatus = (renStatus ?? ren_status) || null;
    if (full_name !== undefined) updates.fullName = full_name || null;
    if (bio !== undefined) updates.bio = bio || null;
    if (company_name !== undefined) updates.companyName = company_name || null;
    if (ic_passport !== undefined) updates.icPassport = ic_passport || null;
    if (designation !== undefined) updates.designation = designation || null;
    if (experience_years !== undefined) updates.experienceYears = experience_years ? Number(experience_years) : null;

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

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const oldPassword = req.body.oldPassword || req.body.old_password;
    const newPassword = req.body.newPassword || req.body.new_password;

    await authService.changePassword(req.user!.id, oldPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { email } = req.body;

    const result = await authService.requestPasswordReset(email);

    const data =
      process.env.NODE_ENV === 'production'
        ? undefined
        : { emailQueued: result.emailQueued };

    res.status(200).json({
      success: true,
      message: 'If that email is registered, a reset link has been sent.',
      ...(data ? { data } : {})
    });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }

    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const token = req.body.token;
    const newPassword = req.body.newPassword || req.body.new_password;

    if (!newPassword) {
      res.status(400).json({
        success: false,
        message: 'New password is required'
      });
      return;
    }

    await authService.resetPasswordWithToken(token, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }

    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

  export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    const result = await authService.verifyUserEmailToken(token);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: result
    });

  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({
        success: false,
        message: error.message
      });
      return;
    }

    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, otp } = req.body;

    if (!user_id || !otp) {
      res.status(400).json({
        success: false,
        message: 'User ID and OTP required'
      });
      return;
    }

    const result = await authService.verifyOTP(user_id, otp);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: result
    });

  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
