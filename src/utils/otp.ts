import crypto from 'crypto';

export const STATIC_OTP = '986677';

export const generateOTP = (length: number = 6): string => {
  const resendConfigured = Boolean(process.env.RESEND_API_KEY?.trim());

  if (!resendConfigured || process.env.NODE_ENV !== 'production') {
    return STATIC_OTP;
  }

  const max = 10 ** length;
  const value = crypto.randomInt(0, max);
  return value.toString().padStart(length, '0');
};

export const isStaticOTP = (otp: string): boolean => {
  return String(otp || '').trim() === STATIC_OTP;
};
