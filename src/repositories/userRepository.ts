import { AppDataSource } from '../config/database.js';
import { User } from '../entities/User.js';
import { UserRepositoryData, ExistingUserCheck } from '../types/user.js';
import { Repository, DeepPartial } from 'typeorm';

let userRepository: Repository<User>;

const getUserRepository = (): Repository<User> => {
  if (!userRepository) {
    userRepository = AppDataSource.getRepository(User);
  }
  return userRepository;
};

export const findValidOTP = async (userId: string, otp: string): Promise<boolean> => {
  const repository = getUserRepository();

  const user = await repository.findOne({
    where: {
      id: userId,
      otp
    }
  });

  if (!user) return false;

  return true;
};

export const createUser = async (userData: UserRepositoryData): Promise<User> => {
  const repository = getUserRepository();

  const userDataPartial: DeepPartial<User> = {
    username: userData.username,
    email: userData.email,
    phoneNumber: userData.phoneNumber || null,
    userType: userData.userType || null,
    renNumber: userData.renNumber || null,
    renStatus: userData.renStatus || null,
    passwordHash: userData.passwordHash,
    verificationToken: userData.verificationToken,
    verificationExpiry: userData.verificationExpiry,
    emailVerified: false,
    otp: userData.otp
  };

  const user = repository.create(userDataPartial);

  return await repository.save(user);
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const repository = getUserRepository();

  return await repository.findOne({
    where: { email },
    select: ['id', 'email', 'passwordHash', 'emailVerified', 'username', 'phoneNumber', 'userType', 'renNumber', 'renStatus', 'profileImage', 'fullName', 'bio', 'companyName', 'icPassport', 'designation', 'experienceYears', 'createdAt', 'updatedAt']
  });
};

export const findUserById = async (id: string): Promise<User | null> => {
  const repository = getUserRepository();

  return await repository.findOne({
    where: { id },
    select: ['id', 'username', 'email', 'phoneNumber', 'userType', 'renNumber', 'renStatus', 'profileImage', 'fullName', 'bio', 'companyName', 'icPassport', 'designation', 'experienceYears', 'emailVerified', 'createdAt', 'updatedAt']
  });
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
  const repository = getUserRepository();

  return await repository.findOne({
    where: { username },
    select: ['id', 'username', 'email']
  });
};

export const findUserByPhoneNumber = async (phoneNumber: string): Promise<User | null> => {
  const repository = getUserRepository();

  return await repository.findOne({
    where: { phoneNumber },
    select: ['id', 'phoneNumber']
  });
};

export const checkUserExists = async (
  username: string,
  email: string,
  phoneNumber?: string
): Promise<ExistingUserCheck | null> => {
  const repository = getUserRepository();

  const qb = repository.createQueryBuilder('user');

  qb.where('user.username = :username', { username })
    .orWhere('user.email = :email', { email });

  if (phoneNumber) {
    qb.orWhere('user.phoneNumber = :phoneNumber', { phoneNumber });
  }

  const existingUser = await qb.getOne();

  if (!existingUser) {
    return null;
  }

  return {
    usernameExists: existingUser.username === username,
    emailExists: existingUser.email === email,
    phoneExists: phoneNumber ? existingUser.phoneNumber === phoneNumber : false
  };
};

export const updateLastLogin = async (userId: string): Promise<void> => {
  const repository = getUserRepository();

  await repository.update(
    { id: userId },
    { lastLogin: new Date() }
  );
};

export const verifyUserEmail = async (verificationToken: string): Promise<User | null> => {
  const repository = getUserRepository();

  return await repository.findOne({
    where: { verificationToken },
    select: ['id', 'verificationExpiry']
  });
};

export const setPasswordResetToken = async (
  userId: string,
  resetToken: string,
  resetExpiry: Date
): Promise<void> => {
  const repository = getUserRepository();

  await repository.update(
    { id: userId },
    {
      verificationToken: resetToken,
      verificationExpiry: resetExpiry
    }
  );
};

export const findUserByResetToken = async (resetToken: string): Promise<User | null> => {
  const repository = getUserRepository();

  return await repository.findOne({
    where: { verificationToken: resetToken },
    select: ['id', 'email', 'username', 'verificationExpiry']
  });
};

export const clearPasswordResetToken = async (userId: string): Promise<void> => {
  const repository = getUserRepository();

  await repository.update(
    { id: userId },
    {
      verificationToken: null,
      verificationExpiry: null
    }
  );
};

export const updateUserEmailVerification = async (userId: string): Promise<User> => {
  const repository = getUserRepository();

  await repository.update(
    { id: userId },
    {
      emailVerified: true,
      otp: null,
      verificationToken: null,
      verificationExpiry: null
    }
  );

  const updatedUser = await repository.findOne({
    where: { id: userId }
  });

  if (!updatedUser) {
    throw new Error('User not found after update');
  }

  return updatedUser;
};

export const getUsersByEmail = async (email: string): Promise<User[]> => {
  const repository = getUserRepository();

  return await repository.find({
    where: { email }
  });
};

export const deleteUser = async (userId: string): Promise<void> => {
  const repository = getUserRepository();

  await repository.delete({ id: userId });
};

export const updateUser = async (
  userId: string,
  updates: {
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
): Promise<User> => {
  const repository = getUserRepository();

  await repository.update({ id: userId }, updates);

  const updatedUser = await repository.findOne({
    where: { id: userId },
    select: ['id', 'username', 'email', 'phoneNumber', 'userType', 'renNumber', 'renStatus', 'profileImage', 'fullName', 'bio', 'companyName', 'icPassport', 'designation', 'experienceYears', 'emailVerified', 'createdAt', 'updatedAt']
  });

  if (!updatedUser) {
    throw new Error('User not found after update');
  }

  return updatedUser;
};

export const updatePassword = async (userId: string, newPasswordHash: string): Promise<void> => {
  const repository = getUserRepository();
  await repository.update({ id: userId }, { passwordHash: newPasswordHash });
};

export const findUserByIdWithPassword = async (id: string): Promise<User | null> => {
  const repository = getUserRepository();
  return await repository.findOne({
    where: { id },
    select: ['id', 'passwordHash']
  });
};

export const updateProfileImage = async (userId: string, imageUrl: string): Promise<User> => {
  const repository = getUserRepository();

  await repository.update({ id: userId }, { profileImage: imageUrl });

  const updatedUser = await repository.findOne({
    where: { id: userId },
    select: ['id', 'username', 'email', 'phoneNumber', 'userType', 'renNumber', 'renStatus', 'profileImage', 'fullName', 'bio', 'companyName', 'icPassport', 'designation', 'experienceYears', 'emailVerified', 'createdAt', 'updatedAt']
  });

  if (!updatedUser) {
    throw new Error('User not found after update');
  }

  return updatedUser;
};

export const getProfileImage = async (userId: string): Promise<string | null> => {
  const repository = getUserRepository();
  const user = await repository.findOne({
    where: { id: userId },
    select: ['profileImage']
  });
  return user?.profileImage ?? null;
};
