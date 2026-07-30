import { AppDataSource } from '../config/database.js';
import { User } from '../entities/User.js';
let userRepository;
const getUserRepository = () => {
    if (!userRepository) {
        userRepository = AppDataSource.getRepository(User);
    }
    return userRepository;
};
export const findValidOTP = async (userId, otp) => {
    const repository = getUserRepository();
    const user = await repository.findOne({
        where: {
            id: userId,
            otp
        }
    });
    if (!user)
        return false;
    return true;
};
export const createUser = async (userData) => {
    const repository = getUserRepository();
    const userDataPartial = {
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
export const findUserByEmail = async (email) => {
    const repository = getUserRepository();
    return await repository.findOne({
        where: { email },
        select: ['id', 'email', 'passwordHash', 'emailVerified', 'username', 'phoneNumber', 'userType', 'renNumber', 'renStatus', 'profileImage', 'fullName', 'bio', 'companyName', 'icPassport', 'designation', 'experienceYears', 'createdAt', 'updatedAt']
    });
};
export const findUserById = async (id) => {
    const repository = getUserRepository();
    return await repository.findOne({
        where: { id },
        select: ['id', 'username', 'email', 'phoneNumber', 'userType', 'renNumber', 'renStatus', 'profileImage', 'fullName', 'bio', 'companyName', 'icPassport', 'designation', 'experienceYears', 'emailVerified', 'createdAt', 'updatedAt']
    });
};
export const findUserByUsername = async (username) => {
    const repository = getUserRepository();
    return await repository.findOne({
        where: { username },
        select: ['id', 'username', 'email']
    });
};
export const findUserByPhoneNumber = async (phoneNumber) => {
    const repository = getUserRepository();
    return await repository.findOne({
        where: { phoneNumber },
        select: ['id', 'phoneNumber']
    });
};
export const checkUserExists = async (username, email, phoneNumber) => {
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
export const updateLastLogin = async (userId) => {
    const repository = getUserRepository();
    await repository.update({ id: userId }, { lastLogin: new Date() });
};
export const verifyUserEmail = async (verificationToken) => {
    const repository = getUserRepository();
    return await repository.findOne({
        where: { verificationToken },
        select: ['id', 'verificationExpiry']
    });
};
export const setPasswordResetToken = async (userId, resetToken, resetExpiry) => {
    const repository = getUserRepository();
    await repository.update({ id: userId }, {
        verificationToken: resetToken,
        verificationExpiry: resetExpiry
    });
};
export const findUserByResetToken = async (resetToken) => {
    const repository = getUserRepository();
    return await repository.findOne({
        where: { verificationToken: resetToken },
        select: ['id', 'email', 'username', 'verificationExpiry']
    });
};
export const clearPasswordResetToken = async (userId) => {
    const repository = getUserRepository();
    await repository.update({ id: userId }, {
        verificationToken: null,
        verificationExpiry: null
    });
};
export const updateUserEmailVerification = async (userId) => {
    const repository = getUserRepository();
    await repository.update({ id: userId }, {
        emailVerified: true,
        otp: null,
        verificationToken: null,
        verificationExpiry: null
    });
    const updatedUser = await repository.findOne({
        where: { id: userId }
    });
    if (!updatedUser) {
        throw new Error('User not found after update');
    }
    return updatedUser;
};
export const getUsersByEmail = async (email) => {
    const repository = getUserRepository();
    return await repository.find({
        where: { email }
    });
};
export const deleteUser = async (userId) => {
    const repository = getUserRepository();
    await repository.delete({ id: userId });
};
export const updateUser = async (userId, updates) => {
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
export const updatePassword = async (userId, newPasswordHash) => {
    const repository = getUserRepository();
    await repository.update({ id: userId }, { passwordHash: newPasswordHash });
};
export const findUserByIdWithPassword = async (id) => {
    const repository = getUserRepository();
    return await repository.findOne({
        where: { id },
        select: ['id', 'passwordHash']
    });
};
export const updateProfileImage = async (userId, imageUrl) => {
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
export const getProfileImage = async (userId) => {
    const repository = getUserRepository();
    const user = await repository.findOne({
        where: { id: userId },
        select: ['profileImage']
    });
    return user?.profileImage ?? null;
};
//# sourceMappingURL=userRepository.js.map