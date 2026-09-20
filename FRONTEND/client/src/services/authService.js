/**
 * SASM Authentication Service (Frontend-Only Placeholder Methods)
 * 
 * Note: These functions encapsulate frontend OTP simulation and state handling.
 * They are structured so that backend API integration (e.g. Brevo/SMTP/REST endpoints)
 * can easily replace the internal simulation logic in Prompt 2.
 */

// Developer test OTP code
export const DEV_TEST_OTP = '123456';

/**
 * Mask an email address for privacy display (e.g. "alex.johnson@example.com" -> "a**********n@example.com")
 */
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const parts = email.trim().split('@');
  if (parts.length !== 2) return email;
  const [name, domain] = parts;
  if (name.length <= 2) {
    return `${name[0]}*@${domain}`;
  }
  const maskedName = `${name[0]}${'*'.repeat(Math.max(3, name.length - 2))}${name[name.length - 1]}`;
  return `${maskedName}@${domain}`;
}

/**
 * Validate signup form inputs
 */
export function validateSignupData({ name, email, password, confirmPassword, role }) {
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = 'Full name is required.';
  }

  if (!email || !email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!role || (role !== 'user' && role !== 'manager')) {
    errors.role = 'Please select an account type (User or Manager).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Frontend simulation: Send OTP
 */
export async function sendOtp(email) {
  // Simulate lightweight network latency
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { success: true, message: `Verification code sent to ${maskEmail(email)}` };
}

/**
 * Frontend simulation: Verify OTP
 * Accepts developer OTP '123456' or any valid 6-digit code for testing
 */
export async function verifyOtp(email, otp) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const cleanOtp = String(otp).trim();
  
  // Accept dev code 123456 or any valid 6-digit number for frontend testing
  if (cleanOtp === DEV_TEST_OTP || cleanOtp === '654321' || (cleanOtp.length === 6 && /^\d+$/.test(cleanOtp))) {
    return { success: true, message: 'Email address successfully verified.' };
  }

  return { success: false, message: 'Invalid verification code. Please try again.' };
}

/**
 * Frontend simulation: Resend OTP
 */
export async function resendOtp(email) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { success: true, message: 'A new verification code has been dispatched.' };
}

/**
 * Frontend simulation: Complete Signup
 */
export async function completeSignup(userData) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const userSession = {
    id: 'usr-' + Date.now(),
    name: userData.name.trim(),
    email: userData.email.trim(),
    role: userData.role === 'manager' ? 'manager' : 'user',
    locationPreference: 'Ahmedabad',
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  };
  return { success: true, user: userSession };
}
