import express from 'express';
import { checkCooldown, createOtpRecord, verifyOtpRecord } from '../services/otpService.js';
import { sendVerificationOtp, sendLoginOtp } from '../services/emailService.js';
import { dbGet, dbRun } from '../config/db.js';

const router = express.Router();

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * POST /api/auth/send-otp
 * Signup Email Verification OTP Dispatch
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

    // 1. Resend Protection: 60-Second Cooldown
    const cooldown = await checkCooldown(normalizedEmail);
    if (cooldown.onCooldown) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${cooldown.secondsRemaining} seconds before requesting another verification code.`
      });
    }

    // 2. Generate 6-digit numeric OTP & store SHA-256 hash in DB
    const { otp } = await createOtpRecord(normalizedEmail);

    // 3. Send Verification Email via SMTP
    await sendVerificationOtp(normalizedEmail, otp);

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
 * POST /api/auth/send-login-otp
 * Login Verification OTP Dispatch
 */
router.post('/send-login-otp', async (req, res, next) => {
  try {
    const { email, role } = req.body || {};

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Resend Protection: 60-Second Cooldown
    const cooldown = await checkCooldown(normalizedEmail);
    if (cooldown.onCooldown) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${cooldown.secondsRemaining} seconds before requesting another verification code.`
      });
    }

    // 2. Generate 6-digit numeric OTP & store SHA-256 hash in DB
    const { otp } = await createOtpRecord(normalizedEmail);

    // 3. Send Login Verification Email via SMTP
    await sendLoginOtp(normalizedEmail, otp);

    return res.status(200).json({
      success: true,
      message: 'Login verification code sent to your email address.'
    });
  } catch (err) {
    console.error('[Auth API Error] send-login-otp failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to send login verification email. Please try again later.'
    });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify 6-digit OTP entered by user (Signup or Login)
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

    const existing = await dbGet(`SELECT id FROM users WHERE LOWER(email) = ?`, [normalizedEmail]);

    let userId;
    const passHash = password ? String(password).trim() : null;
    if (existing) {
      await dbRun(
        `UPDATE users SET name = ?, role = ?, password_hash = COALESCE(?, password_hash), email_verified = 1 WHERE LOWER(email) = ?`,
        [name.trim(), userRole, passHash, normalizedEmail]
      );
      userId = existing.id;
    } else {
      const runResult = await dbRun(
        `INSERT INTO users (name, email, password_hash, role, email_verified, created_at)
         VALUES (?, ?, ?, ?, 1, ?)`,
        [name.trim(), normalizedEmail, passHash, userRole, createdAt]
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

/**
 * GET /api/auth/me
 * Retrieves current authenticated user profile & event mapping
 */
router.get('/me', async (req, res, next) => {
  try {
    const authEmail =
      req.headers['x-user-email'] ||
      req.headers['x-manager-email'] ||
      req.query.email;

    if (!authEmail || !isValidEmail(String(authEmail))) {
      return res.status(401).json({
        success: false,
        message: '401 Unauthorized: Valid authentication token or header required.'
      });
    }

    const normalizedEmail = String(authEmail).trim().toLowerCase();
    const userRecord = await dbGet(`SELECT * FROM users WHERE LOWER(email) = ?`, [normalizedEmail]);

    if (!userRecord) {
      return res.status(401).json({
        success: false,
        message: '401 Unauthorized: User record not found.'
      });
    }

    const eventRecord = await dbGet(`SELECT * FROM events WHERE id = ?`, [userRecord.event_id || 1]);
    const eventName = eventRecord?.name || 'TECHFEST 2026';

    return res.status(200).json({
      success: true,
      user: {
        id: `usr-${userRecord.id}`,
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role || 'user',
        event_id: userRecord.event_id || 1,
        eventId: userRecord.event_id || 1,
        event_name: eventName,
        organization: eventName,
        organizationId: `org-${userRecord.event_id || 1}`,
        email_verified: Boolean(userRecord.email_verified)
      }
    });
  } catch (err) {
    console.error('[Auth API Error] me failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user authentication state.'
    });
  }
});

/**
 * POST /api/auth/login
 * Manager / Speaker / User Authenticated Sign In Endpoint
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body || {};

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    if (!password || !String(password).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to sign in.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userRecord = await dbGet(`SELECT * FROM users WHERE LOWER(email) = ?`, [normalizedEmail]);

    if (!userRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const inputPass = String(password).trim();
    const expectedTempPass = userRecord.temp_password ? String(userRecord.temp_password).trim() : null;
    const expectedHashPass = userRecord.password_hash ? String(userRecord.password_hash).trim() : null;

    if (!expectedTempPass && !expectedHashPass) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Password Validation: Verify input password against temp_password or password_hash
    const isPassValid =
      (expectedTempPass && inputPass === expectedTempPass) ||
      (expectedHashPass && inputPass === expectedHashPass);

    if (!isPassValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const actualRole = userRecord.role || 'user';
    const eventId = userRecord.event_id || 1;
    const eventRecord = await dbGet(`SELECT * FROM events WHERE id = ?`, [eventId]);
    const eventName = eventRecord?.name || 'TECHFEST 2026';

    return res.status(200).json({
      success: true,
      user: {
        id: `usr-${userRecord.id}`,
        name: userRecord.name,
        email: userRecord.email,
        role: actualRole,
        event_id: eventId,
        eventId: eventId,
        event_name: eventName,
        organization: eventName,
        organizationId: `org-${eventId}`,
        email_verified: Boolean(userRecord.email_verified),
        logged_in_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('[Auth API Error] login failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed. Please check your credentials.'
    });
  }
});

export default router;
