import crypto from 'crypto';
import { dbGet, dbRun } from '../config/db.js';

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
export function generateOtp() {
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

/**
 * Compute SHA-256 hash of an OTP string
 */
export function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
}

/**
 * Check 60-second resend cooldown for a given email
 */
export async function checkCooldown(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const lastOtp = await dbGet(
    `SELECT created_at FROM otps WHERE LOWER(email) = ? ORDER BY id DESC LIMIT 1`,
    [normalizedEmail]
  );

  if (!lastOtp || !lastOtp.created_at) {
    return { onCooldown: false, secondsRemaining: 0 };
  }

  const elapsedSeconds = Math.floor((Date.now() - new Date(lastOtp.created_at).getTime()) / 1000);
  const cooldownDuration = 60; // 60 seconds resend cooldown

  if (elapsedSeconds < cooldownDuration) {
    return {
      onCooldown: true,
      secondsRemaining: cooldownDuration - elapsedSeconds
    };
  }

  return { onCooldown: false, secondsRemaining: 0 };
}

/**
 * Create a new OTP record in the database
 */
export async function createOtpRecord(email) {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Invalidate any previous active OTPs for this email
  await dbRun(
    `UPDATE otps SET is_used = 1 WHERE LOWER(email) = ? AND is_used = 0`,
    [normalizedEmail]
  );

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes validity

  await dbRun(
    `INSERT INTO otps (email, otp_hash, expires_at, attempts, created_at, is_used)
     VALUES (?, ?, ?, 0, ?, 0)`,
    [normalizedEmail, otpHash, expiresAt, createdAt]
  );

  return { otp, expiresAt, createdAt };
}

/**
 * Verify an entered OTP against stored hash
 */
export async function verifyOtpRecord(email, userOtp) {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanOtp = String(userOtp).trim();

  // Retrieve latest active OTP record for email
  const record = await dbGet(
    `SELECT * FROM otps WHERE LOWER(email) = ? AND is_used = 0 ORDER BY id DESC LIMIT 1`,
    [normalizedEmail]
  );

  if (!record) {
    return {
      success: false,
      message: 'Verification code has expired or is invalid. Please request a new code.'
    };
  }

  // Check Expiration (5 minutes)
  const isExpired = new Date(record.expires_at).getTime() < Date.now();
  if (isExpired) {
    await dbRun(`UPDATE otps SET is_used = 1 WHERE id = ?`, [record.id]);
    return {
      success: false,
      message: 'Verification code has expired. Please request a new code.'
    };
  }

  // Check Attempt Rate Limit (max 5 failed attempts)
  if (record.attempts >= 5) {
    await dbRun(`UPDATE otps SET is_used = 1 WHERE id = ?`, [record.id]);
    return {
      success: false,
      message: 'Too many failed attempts. Please request a new verification code.'
    };
  }

  // Hash comparison
  const inputHash = hashOtp(cleanOtp);
  if (inputHash !== record.otp_hash) {
    await dbRun(`UPDATE otps SET attempts = attempts + 1 WHERE id = ?`, [record.id]);
    return {
      success: false,
      message: 'Invalid verification code. Please try again.'
    };
  }

  // Successful Verification: Mark single-use OTP as used
  await dbRun(`UPDATE otps SET is_used = 1 WHERE id = ?`, [record.id]);

  // Update email_verified status in users table if user exists
  await dbRun(`UPDATE users SET email_verified = 1 WHERE LOWER(email) = ?`, [normalizedEmail]);

  return {
    success: true,
    message: 'Email address successfully verified'
  };
}
