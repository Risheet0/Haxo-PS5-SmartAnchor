import express from 'express';
import { checkCooldown, createOtpRecord, verifyOtpRecord } from '../services/otpService.js';
import { sendOtpEmail } from '../services/emailService.js';
import { dbGet, dbRun } from '../config/db.js';

const router = express.Router();

/**
 * Helper to validate email format
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * POST /api/auth/send-otp
 * Request backend to generate 6-digit OTP and send email via Brevo
 */
router.post('/send-otp', async (req, res, next) => {
  try {
    const { email } = req.body || {};

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Resend Protection: Check 60-Second Cooldown
    const cooldown = await checkCooldown(normalizedEmail);
    if (cooldown.onCooldown) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${cooldown.secondsRemaining} seconds before requesting another verification code.`
      });
    }

    // 2. Generate cryptographically secure OTP & store hash
    const { otp } = await createOtpRecord(normalizedEmail);

    // 3. Dispatch Email via Brevo API
    await sendOtpEmail(normalizedEmail, otp);

    // 4. Return success response (NEVER return the actual OTP in JSON response!)
    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (err) {
    console.error('[Auth API Error] send-otp failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to send verification email. Please try again later.'
    });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify 6-digit OTP entered by user
 */
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body || {};

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    if (!otp || String(otp).trim().length !== 6 || !/^\d+$/.test(String(otp).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit verification code.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await verifyOtpRecord(normalizedEmail, otp);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Email address successfully verified'
    });
  } catch (err) {
    console.error('[Auth API Error] verify-otp failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while verifying the code. Please try again.'
    });
  }
});

/**
 * POST /api/auth/complete-signup
 * Finalize user registration and store user profile in database
 */
router.post('/complete-signup', async (req, res, next) => {
  try {
    const { name, email, role, password } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userRole = role === 'manager' ? 'manager' : 'user';
    const createdAt = new Date().toISOString();

    // Check if user already exists
    const existing = await dbGet(`SELECT id FROM users WHERE LOWER(email) = ?`, [normalizedEmail]);

    let userId;
    if (existing) {
      await dbRun(
        `UPDATE users SET name = ?, role = ?, email_verified = 1 WHERE LOWER(email) = ?`,
        [name.trim(), userRole, normalizedEmail]
      );
      userId = existing.id;
    } else {
      const runResult = await dbRun(
        `INSERT INTO users (name, email, role, email_verified, created_at)
         VALUES (?, ?, ?, 1, ?)`,
        [name.trim(), normalizedEmail, userRole, createdAt]
      );
      userId = runResult.lastID;
    }

    const userSession = {
      id: `usr-${userId}`,
      name: name.trim(),
      email: normalizedEmail,
      role: userRole,
      locationPreference: 'Ahmedabad',
      email_verified: true,
      created_at: createdAt
    };

    return res.status(200).json({
      success: true,
      user: userSession
    });
  } catch (err) {
    console.error('[Auth API Error] complete-signup failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to complete signup. Please try again.'
    });
  }
});

export default router;
