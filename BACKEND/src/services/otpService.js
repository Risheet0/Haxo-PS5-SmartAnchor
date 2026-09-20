import crypto from 'crypto';
import { dbGet, dbAll, dbRun } from '../config/db.js';

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
 * Verify an entered OTP against stored active hashes for an email
 */
export async function verifyOtpRecord(email, userOtp) {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanOtp = String(userOtp).trim();
  const nowIso = new Date().toISOString();

  // Retrieve all unused, unexpired OTP records for email
  const records = await dbAll(
    `SELECT * FROM otps WHERE LOWER(email) = ? AND is_used = 0 AND expires_at > ? ORDER BY id DESC`,
    [normalizedEmail, nowIso]
  );

  if (!records || records.length === 0) {
    return {
      success: false,
      message: 'Verification code has expired or is invalid. Please request a new code.'
    };
  }

  const inputHash = hashOtp(cleanOtp);
  let matchedRecord = null;

  for (const record of records) {
    if (record.attempts >= 5) continue;
    if (record.otp_hash === inputHash) {
      matchedRecord = record;
      break;
    }
  }

  if (!matchedRecord) {
    // Increment attempts on the active records
    for (const record of records) {
      await dbRun(`UPDATE otps SET attempts = attempts + 1 WHERE id = ?`, [record.id]);
    }
    return {
      success: false,
      message: 'Invalid verification code. Please try again.'
    };
  }

  // Successful Verification: Mark ALL active OTPs for this email as used
  await dbRun(
    `UPDATE otps SET is_used = 1 WHERE LOWER(email) = ? AND is_used = 0`,
    [normalizedEmail]
  );

  // Update email_verified status in users table if user exists
  await dbRun(`UPDATE users SET email_verified = 1 WHERE LOWER(email) = ?`, [normalizedEmail]);

  return {
    success: true,
    message: 'Email address successfully verified'
  };
}
