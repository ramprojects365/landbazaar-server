import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as userRepository from '../repositories/userRepository.js';
import { generateOTP } from '../utils/otp.js';
import { sendOtpEmail, sendPasswordResetEmail } from './emailService.js';
const BCRYPT_SALT_ROUNDS = 10;
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
const PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = 60;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const REN_NUMBER_PATTERN = /^(REN|PEA)\d{4,6}$/;
const VERIFIED_REN_STATUS = 'verified';
const NOT_VERIFIED_REN_STATUS = 'not_verified';
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};
export const generateJWTToken = (userId, email) => {
    return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};
const calculateVerificationExpiry = () => {
    return new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
};
const calculatePasswordResetExpiry = () => {
    return new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);
};
const generateUsernameFromEmail = (email) => {
    const localPart = email.split('@')[0] || 'user';
    const base = localPart
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 21) || 'user';
    return `${base}_${crypto.randomBytes(4).toString('hex')}`;
};
const normalizeRenNumber = (renNumber) => {
    const normalized = renNumber?.trim().toUpperCase() || null;
    if (normalized && !REN_NUMBER_PATTERN.test(normalized)) {
        throw {
            status: 400,
            message: 'REN/PEA number must start with REN or PEA followed by 4-6 digits'
        };
    }
    return normalized;
};
const normalizeRenStatus = (renStatus) => {
    const normalized = renStatus?.trim().toLowerCase().replace(/\s+/g, '_');
    return normalized === VERIFIED_REN_STATUS ? VERIFIED_REN_STATUS : NOT_VERIFIED_REN_STATUS;
};
const withRenVerification = (user) => {
    const renStatus = normalizeRenStatus(user.renStatus);
    const renVerified = renStatus === VERIFIED_REN_STATUS;
    return {
        ...user,
        renStatus,
        renVerified,
        renStatusLabel: renVerified ? 'Verified' : 'Not verified',
        renStatusIcon: renVerified ? 'badge-check' : 'badge-alert'
    };
};
export const registerUser = async (registrationData) => {
    const { email, password } = registrationData;
    const username = registrationData.username?.trim() || generateUsernameFromEmail(email);
    const userType = registrationData.userType?.trim() || null;
    const renNumber = normalizeRenNumber(registrationData.renNumber);
    const renStatus = NOT_VERIFIED_REN_STATUS;
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
        throw {
            status: 400,
            message: 'Email already exists'
        };
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const verificationToken = generateVerificationToken();
    const verificationExpiry = calculateVerificationExpiry();
    const otp = generateOTP();
    const newUser = await userRepository.createUser({
        username,
        email,
        phoneNumber: registrationData.phoneNumber,
        userType,
        renNumber,
        renStatus,
        passwordHash,
        verificationToken,
        verificationExpiry,
        otp
    });
    try {
        await sendOtpEmail(newUser.email, newUser.username, otp);
    }
    catch (err) {
        console.error('Failed to send OTP email:', err);
    }
    return withRenVerification({
        userId: newUser.id,
        username: newUser.username,
        email: newUser.email,
        userType: newUser.userType,
        renNumber: newUser.renNumber,
        renStatus: newUser.renStatus,
        emailVerified: newUser.emailVerified
    });
};
export const loginUser = async (credentials) => {
    const { email, password } = credentials;
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
        throw {
            status: 401,
            message: 'Invalid email or password'
        };
    }
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
        throw {
            status: 401,
            message: 'Invalid email or password'
        };
    }
    if (!user.emailVerified) {
        throw {
            status: 403,
            message: 'Please verify your email before logging in'
        };
    }
    await userRepository.updateLastLogin(user.id);
    const token = generateJWTToken(user.id, user.email);
    return {
        token,
        user: withRenVerification({
            id: user.id,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            userType: user.userType,
            renNumber: user.renNumber,
            renStatus: user.renStatus,
            profileImage: user.profileImage,
            fullName: user.fullName,
            bio: user.bio,
            companyName: user.companyName,
            icPassport: user.icPassport,
            designation: user.designation,
            experienceYears: user.experienceYears,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        })
    };
};
export const verifyUserEmailToken = async (token) => {
    if (!token) {
        throw {
            status: 400,
            message: 'Verification token required'
        };
    }
    const user = await userRepository.verifyUserEmail(token);
    if (!user) {
        throw {
            status: 400,
            message: 'Invalid verification token'
        };
    }
    if (user.verificationExpiry && new Date() > new Date(user.verificationExpiry)) {
        throw {
            status: 400,
            message: 'Verification token has expired'
        };
    }
    const updatedUser = await userRepository.updateUserEmailVerification(user.id);
    return {
        id: updatedUser.id,
        emailVerified: updatedUser.emailVerified
    };
};
export const getUserProfile = async (userId) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
        throw { status: 404, message: 'User not found' };
    }
    return withRenVerification({
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.userType,
        renNumber: user.renNumber,
        renStatus: user.renStatus,
        profileImage: user.profileImage,
        fullName: user.fullName,
        bio: user.bio,
        companyName: user.companyName,
        icPassport: user.icPassport,
        designation: user.designation,
        experienceYears: user.experienceYears,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    });
};
export const updateUserProfile = async (userId, updates) => {
    const renNumberChanged = updates.renNumber !== undefined;
    if (updates.renNumber !== undefined) {
        updates.renNumber = normalizeRenNumber(updates.renNumber);
    }
    if (updates.renStatus !== undefined) {
        delete updates.renStatus;
    }
    if (renNumberChanged) {
        updates.renStatus = NOT_VERIFIED_REN_STATUS;
    }
    if (updates.username) {
        const existing = await userRepository.findUserByUsername(updates.username);
        if (existing && existing.id !== userId) {
            throw { status: 400, message: 'Username already taken' };
        }
    }
    const updated = await userRepository.updateUser(userId, updates);
    return withRenVerification({
        id: updated.id,
        username: updated.username,
        email: updated.email,
        phoneNumber: updated.phoneNumber,
        userType: updated.userType,
        renNumber: updated.renNumber,
        renStatus: updated.renStatus,
        profileImage: updated.profileImage,
        fullName: updated.fullName,
        bio: updated.bio,
        companyName: updated.companyName,
        icPassport: updated.icPassport,
        designation: updated.designation,
        experienceYears: updated.experienceYears,
        emailVerified: updated.emailVerified,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt
    });
};
export const uploadProfileImage = async (userId, imageUrl) => {
    const updated = await userRepository.updateProfileImage(userId, imageUrl);
    return withRenVerification({
        id: updated.id,
        username: updated.username,
        email: updated.email,
        phoneNumber: updated.phoneNumber,
        userType: updated.userType,
        renNumber: updated.renNumber,
        renStatus: updated.renStatus,
        profileImage: updated.profileImage,
        fullName: updated.fullName,
        bio: updated.bio,
        companyName: updated.companyName,
        icPassport: updated.icPassport,
        designation: updated.designation,
        experienceYears: updated.experienceYears,
        emailVerified: updated.emailVerified,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt
    });
};
export const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await userRepository.findUserByIdWithPassword(userId);
    if (!user) {
        throw { status: 404, message: 'User not found' };
    }
    const passwordMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!passwordMatch) {
        throw { status: 400, message: 'Old password is incorrect' };
    }
    const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    await userRepository.updatePassword(userId, newPasswordHash);
};
export const requestPasswordReset = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepository.findUserByEmail(normalizedEmail);
    if (!user) {
        console.log('Password reset requested for non-existing email:', normalizedEmail);
        return { emailQueued: false };
    }
    const resetToken = generateVerificationToken();
    await userRepository.setPasswordResetToken(user.id, resetToken, calculatePasswordResetExpiry());
    await sendPasswordResetEmail({
        to: user.email,
        username: user.username,
        token: resetToken
    });
    return { emailQueued: true };
};
export const resetPasswordWithToken = async (token, newPassword) => {
    if (!token) {
        throw { status: 400, message: 'Reset token is required' };
    }
    const user = await userRepository.findUserByResetToken(token);
    if (!user) {
        throw { status: 400, message: 'Invalid or expired reset link' };
    }
    if (!user.verificationExpiry || new Date() > new Date(user.verificationExpiry)) {
        await userRepository.clearPasswordResetToken(user.id);
        throw { status: 400, message: 'Reset link has expired' };
    }
    const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    await userRepository.updatePassword(user.id, newPasswordHash);
    await userRepository.clearPasswordResetToken(user.id);
};
export const validateToken = async (userId) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
        throw {
            status: 403,
            message: 'Invalid token or user not found'
        };
    }
    return withRenVerification(user);
};
export const verifyOTP = async (userId, code) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
        throw { status: 404, message: 'User not found' };
    }
    const otpRecord = await userRepository.findValidOTP(userId, code);
    if (!otpRecord) {
        throw { status: 400, message: 'Invalid or expired OTP' };
    }
    const updatedUser = await userRepository.updateUserEmailVerification(userId);
    return {
        userId: updatedUser.id,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified
    };
};
export const verifyOtpByEmail = async (email, code) => {
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
        throw {
            status: 404,
            message: 'User not found'
        };
    }
    if (user.emailVerified) {
        throw {
            status: 400,
            message: 'Account is already verified'
        };
    }
    // ✅ FIXED HERE
    const otpMatch = await userRepository.findValidOTP(user.id, code);
    if (!otpMatch) {
        throw {
            status: 400,
            message: 'Invalid or expired OTP'
        };
    }
    const updatedUser = await userRepository.updateUserEmailVerification(user.id);
    const token = generateJWTToken(updatedUser.id, updatedUser.email);
    return {
        token,
        user: withRenVerification({
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
            userType: updatedUser.userType,
            renNumber: updatedUser.renNumber,
            renStatus: updatedUser.renStatus,
            emailVerified: updatedUser.emailVerified,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        })
    };
};
//# sourceMappingURL=authService.js.map