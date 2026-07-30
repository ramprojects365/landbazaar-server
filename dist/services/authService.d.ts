import { RegistrationData, LoginCredentials, AuthToken, UserProfile, UpdateProfileData } from '../types/user.js';
export declare const generateJWTToken: (userId: string, email: string) => string;
export declare const registerUser: (registrationData: RegistrationData) => Promise<{
    userId: string;
    username: string;
    email: string;
    userType: string | null;
    renNumber: string | null;
    renStatus: string | null;
    emailVerified: boolean;
} & {
    renStatus: string;
    renVerified: boolean;
    renStatusLabel: string;
    renStatusIcon: string;
}>;
export declare const loginUser: (credentials: LoginCredentials) => Promise<AuthToken>;
export declare const verifyUserEmailToken: (token: string) => Promise<{
    id: string;
    emailVerified: boolean;
}>;
export declare const getUserProfile: (userId: string) => Promise<UserProfile>;
export declare const updateUserProfile: (userId: string, updates: UpdateProfileData) => Promise<UserProfile>;
export declare const uploadProfileImage: (userId: string, imageUrl: string) => Promise<UserProfile>;
export declare const changePassword: (userId: string, oldPassword: string, newPassword: string) => Promise<void>;
export declare const requestPasswordReset: (email: string) => Promise<{
    emailQueued: boolean;
}>;
export declare const resetPasswordWithToken: (token: string, newPassword: string) => Promise<void>;
export declare const validateToken: (userId: string) => Promise<UserProfile>;
export declare const verifyOTP: (userId: string, code: string) => Promise<{
    userId: string;
    email: string;
    emailVerified: boolean;
}>;
export declare const verifyOtpByEmail: (email: string, code: string) => Promise<AuthToken>;
//# sourceMappingURL=authService.d.ts.map