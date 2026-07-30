export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  phone_number?: string | null;
  password_hash: string;
  email_verified: boolean;
  verification_token?: string | null;
  verification_expiry?: Date | null;
  last_login?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string | null;
  userType?: string | null;
  renNumber?: string | null;
  renStatus?: string | null;
  renVerified?: boolean;
  renStatusLabel?: string;
  renStatusIcon?: string;
  profileImage?: string | null;
  fullName?: string | null;
  bio?: string | null;
  companyName?: string | null;
  icPassport?: string | null;
  designation?: string | null;
  experienceYears?: number | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  username?: string;
  phoneNumber?: string | null;
  userType?: string | null;
  renNumber?: string | null;
  renStatus?: string | null;
  fullName?: string | null;
  bio?: string | null;
  companyName?: string | null;
  icPassport?: string | null;
  designation?: string | null;
  experienceYears?: number | null;
}

export interface RegistrationData {
  username?: string;
  email: string;
  phoneNumber?: string;
  userType?: string;
  renNumber?: string;
  renStatus?: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  token: string;
  user: UserProfile;
}

export interface UserRepositoryData {
  username: string;
  email: string;
  phoneNumber?: string;
  userType?: string | null;
  renNumber?: string | null;
  renStatus?: string | null;
  passwordHash: string;
  verificationToken: string;
  verificationExpiry: Date;
  otp:string;
}

export interface ExistingUserCheck {
  usernameExists: boolean;
  emailExists: boolean;
  phoneExists: boolean;
}

export class User {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string | null;
  passwordHash: string;
  emailVerified: boolean;
  verificationToken?: string | null;
  verificationExpiry?: Date | null;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: UserData) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.phoneNumber = data.phone_number;
    this.passwordHash = data.password_hash;
    this.emailVerified = data.email_verified;
    this.verificationToken = data.verification_token;
    this.verificationExpiry = data.verification_expiry;
    this.lastLogin = data.last_login;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  toJSON(): Omit<UserProfile, 'phoneNumber'> & { phoneNumber?: string | null } {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      phoneNumber: this.phoneNumber,
      emailVerified: this.emailVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toProfileJSON(): UserProfile {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      phoneNumber: this.phoneNumber,
      emailVerified: this.emailVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
