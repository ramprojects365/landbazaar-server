import crypto from 'crypto';

export const generateOTP = (length: number = 6): string => {
  const max = 10 ** length;
  const value = crypto.randomInt(0, max);
  return value.toString().padStart(length, '0');
};
