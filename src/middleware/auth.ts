import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as authService from '../services/authService.js';
import { UserProfile } from '../types/user.js';

interface JWTPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    const user = await authService.validateToken(decoded.userId);

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      res.status(403).json({
        success: false,
        message: 'Invalid token'
      });
      return;
    }
    if (error.name === 'TokenExpiredError') {
      res.status(403).json({
        success: false,
        message: 'Token expired'
      });
      return;
    }
    if (error.status) {
      res.status(error.status).json({
        success: false,
        message: error.message
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};
