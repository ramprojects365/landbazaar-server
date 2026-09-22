import crypto from 'crypto';

export const STATIC_OTP = '986677';

export const getStaticOtpAllowedEmails = (): Set<string> => {
  const rawValue = process.env.STATIC_OTP_ALLOWED_EMAILS || '';

  return new Set(
    rawValue
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
};

export const isStaticOTPAllowedForEmail = (email?: string | null): boolean => {
  if (!email) return false;

  const normalizedEmail = String(email).trim().toLowerCase();
  return getStaticOtpAllowedEmails().has(normalizedEmail);
};

export const isStaticOTP = (otp: string): boolean => {
  return String(otp || '').trim() === STATIC_OTP;
};

export const generateOTP = (length: number = 6): string => {
  const max = 10 ** length;
  const value = crypto.randomInt(0, max);
  return value.toString().padStart(length, '0');
};
