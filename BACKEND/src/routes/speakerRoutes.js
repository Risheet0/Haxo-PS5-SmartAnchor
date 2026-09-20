import express from 'express';
import { dbAll, dbGet, dbRun } from '../config/db.js';
import { broadcastSpeakerUpdated } from '../services/socketService.js';
import { checkCooldown, createOtpRecord, verifyOtpRecord } from '../services/otpService.js';
import {
  sendSpeakerVerificationOtp,
  sendManagerSpeakerCreatedNotification,
  sendSpeakerAccountCredentialsEmail
} from '../services/emailService.js';

const router = express.Router();

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Retrieve existing authenticated Manager record from database
 */
async function getAuthenticatedManager(req) {
  const reqEmail = req.headers['x-manager-email'] || req.headers['x-user-email'];
  const reqName = req.headers['x-manager-name'];

  if (reqEmail && isValidEmail(reqEmail)) {
    const normalized = reqEmail.trim().toLowerCase();
    const dbManager = await dbGet(
      `SELECT * FROM users WHERE LOWER(email) = ? AND role = 'manager'`,
      [normalized]
    );
    if (dbManager) return dbManager;

    const dbUser = await dbGet(`SELECT * FROM users WHERE LOWER(email) = ?`, [normalized]);
    if (dbUser) return dbUser;

    return {
      name: reqName || 'Event Manager',
      email: normalized,
      role: 'manager'
    };
  }

  // Fallback to existing registered manager account in SQLite database
  const firstDbManager = await dbGet(`SELECT * FROM users WHERE role = 'manager' LIMIT 1`);
  if (firstDbManager) return firstDbManager;

  const defaultEmail = process.env.SENDER_EMAIL || process.env.SMTP_USER || 'ddoinfo098@gmail.com';
  return {
    name: 'Event Manager',
    email: defaultEmail,
    role: 'manager'
  };
}

/**
 * GET /api/speakers
 * Returns all speaker profiles
 */
router.get('/', async (req, res, next) => {
  try {
    const speakers = await dbAll(`SELECT * FROM speakers ORDER BY id ASC`);
    res.json(speakers);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/speakers/send-otp
 * Dispatches 6-digit OTP for speaker email verification
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

    const cooldown = await checkCooldown(normalizedEmail);
    if (cooldown.onCooldown) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${cooldown.secondsRemaining} seconds before requesting another code.`
      });
    }

    const { otp } = await createOtpRecord(normalizedEmail);
    await sendSpeakerVerificationOtp(normalizedEmail, otp);

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to speaker email.'
    });
  } catch (err) {
    console.error('[Speaker API Error] send-otp failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to send verification email. Please try again later.'
    });
  }
});

/**
 * POST /api/speakers/verify-otp
 * Verifies speaker OTP
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
      message: 'Speaker email verified successfully'
    });
  } catch (err) {
    console.error('[Speaker API Error] verify-otp failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while verifying the code.'
    });
  }
});

/**
 * POST /api/speakers
 * Creates a new speaker profile & provisions Speaker user account associated with event (TechFest 2026)
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      name = 'Anonymous Dignitary',
      email = '',
      email_verified = false,
      designation = 'Special Guest',
      organization = 'Industry Partner',
      bio = '',
      topic = '',
      avatar_url = ''
    } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid speaker email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify speaker email OTP completion
    const verifiedRecord = await dbGet(
      `SELECT id FROM otps WHERE LOWER(email) = ? AND is_used = 1 LIMIT 1`,
      [normalizedEmail]
    );

    if (!verifiedRecord && !email_verified) {
      return res.status(400).json({
        error: 'Speaker email address must be verified via OTP before creating profile.'
      });
    }

    // Duplicate submission protection: check if created within last 15 seconds
    const existingSpeaker = await dbGet(
      `SELECT * FROM speakers WHERE LOWER(email) = ? ORDER BY id DESC LIMIT 1`,
      [normalizedEmail]
    );

    let targetSpeaker = existingSpeaker;

    if (!existingSpeaker) {
      const result = await dbRun(
        `INSERT INTO speakers (name, email, email_verified, designation, organization, bio, topic, avatar_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, normalizedEmail, 1, designation, organization, bio, topic, avatar_url, new Date().toISOString()]
      );

      targetSpeaker = await dbGet(`SELECT * FROM speakers WHERE id = ?`, [result.lastID]);

      await dbRun(
        `INSERT INTO logs (action_type, message, timestamp) VALUES (?, ?, ?)`,
        ['SPEAKER_ADDED', `Speaker "${targetSpeaker.name}" registered (${normalizedEmail}).`, new Date().toISOString()]
      );

      broadcastSpeakerUpdated(targetSpeaker);
    }

    // Provision / update Speaker user login account in users table (Role = 'speaker', Event ID = 1)
    const tempPassword = `Spk-${Math.floor(100000 + Math.random() * 900000)}`;
    const existingUser = await dbGet(`SELECT id, temp_password FROM users WHERE LOWER(email) = ?`, [normalizedEmail]);

    let speakerTempPassword = tempPassword;
    if (existingUser) {
      speakerTempPassword = existingUser.temp_password || tempPassword;
      await dbRun(
        `UPDATE users SET name = ?, role = 'speaker', event_id = 1, temp_password = ?, email_verified = 1 WHERE LOWER(email) = ?`,
        [name.trim(), speakerTempPassword, normalizedEmail]
      );
    } else {
      await dbRun(
        `INSERT INTO users (name, email, role, event_id, temp_password, email_verified, created_at)
         VALUES (?, ?, 'speaker', 1, ?, 1, ?)`,
        [name.trim(), normalizedEmail, speakerTempPassword, new Date().toISOString()]
      );
    }

    // Dispatch credentials email to Speaker
    try {
      const loginUrl = req.headers.origin ? `${req.headers.origin}/login` : 'http://localhost:5173/login';
      await sendSpeakerAccountCredentialsEmail({
        speakerName: targetSpeaker.name,
        speakerEmail: targetSpeaker.email,
        tempPassword: speakerTempPassword,
        eventName: 'TechFest 2026',
        loginUrl
      });
    } catch (spkMailErr) {
      console.error('[Speaker API Error] Speaker credentials email dispatch failed:', spkMailErr.message);
    }

    // Obtain authenticated Manager identity
    const managerUser = await getAuthenticatedManager(req);

    // Send notification email to Manager's registered email
    let emailSent = false;
    try {
      const loginUrl = req.headers.origin ? `${req.headers.origin}/login` : 'http://localhost:5173/login';
      const mailRes = await sendManagerSpeakerCreatedNotification({
        managerName: managerUser.name || 'Event Manager',
        managerEmail: managerUser.email,
        speakerName: targetSpeaker.name,
        speakerDesignation: targetSpeaker.designation,
        speakerOrganization: targetSpeaker.organization,
        speakerEmail: targetSpeaker.email,
        loginUrl
      });
      emailSent = Boolean(mailRes && mailRes.success);
    } catch (mailErr) {
      console.error('[Speaker API Error] Notification email dispatch failed:', mailErr.message);
    }

    return res.status(201).json({
      ...targetSpeaker,
      emailSent,
      managerEmail: managerUser.email,
      tempPassword: speakerTempPassword
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/speakers/:id/resend-manager-email
 * Resends notification email to Manager WITHOUT creating a new speaker record
 */
router.post('/:id/resend-manager-email', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const speaker = await dbGet(`SELECT * FROM speakers WHERE id = ?`, [id]);
    if (!speaker) {
      return res.status(404).json({ success: false, message: 'Speaker profile not found.' });
    }

    const managerUser = await getAuthenticatedManager(req);
    const loginUrl = req.headers.origin ? `${req.headers.origin}/login` : 'http://localhost:5173/login';

    const mailRes = await sendManagerSpeakerCreatedNotification({
      managerName: managerUser.name || 'Event Manager',
      managerEmail: managerUser.email,
      speakerName: speaker.name,
      speakerDesignation: speaker.designation,
      speakerOrganization: speaker.organization,
      speakerEmail: speaker.email,
      loginUrl
    });

    if (mailRes && mailRes.success) {
      return res.json({
        success: true,
        message: `Notification email successfully delivered to ${managerUser.email}`,
        managerEmail: managerUser.email
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Unable to deliver notification email via SMTP. Please try again.'
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/speakers/:id
 * Updates an existing speaker profile
 */
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await dbGet(`SELECT * FROM speakers WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Speaker not found' });
    }

    const {
      name = existing.name,
      email = existing.email || '',
      email_verified = existing.email_verified || 1,
      designation = existing.designation,
      organization = existing.organization,
      bio = existing.bio,
      topic = existing.topic,
      avatar_url = existing.avatar_url
    } = req.body;

    await dbRun(
      `UPDATE speakers SET
        name = ?,
        email = ?,
        email_verified = ?,
        designation = ?,
        organization = ?,
        bio = ?,
        topic = ?,
        avatar_url = ?
      WHERE id = ?`,
      [name, email, email_verified ? 1 : 0, designation, organization, bio, topic, avatar_url, id]
    );

    // Also update any agenda sessions that reference this speaker
    await dbRun(
      `UPDATE agenda SET
        speaker_name = ?,
        speaker_org = ?,
        speaker_designation = ?
      WHERE speaker_id = ?`,
      [name, organization, designation, id]
    );

    const updated = await dbGet(`SELECT * FROM speakers WHERE id = ?`, [id]);

    await dbRun(
      `INSERT INTO logs (action_type, message, timestamp) VALUES (?, ?, ?)`,
      ['SPEAKER_UPDATED', `Speaker profile for "${updated.name}" updated.`, new Date().toISOString()]
    );

    broadcastSpeakerUpdated(updated);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/speakers/:id
 * Deletes a speaker profile
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await dbGet(`SELECT * FROM speakers WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Speaker not found' });
    }

    await dbRun(`DELETE FROM speakers WHERE id = ?`, [id]);

    // Detach from agenda items
    await dbRun(
      `UPDATE agenda SET
        speaker_id = NULL,
        speaker_name = NULL,
        speaker_org = NULL,
        speaker_designation = NULL
      WHERE speaker_id = ?`,
      [id]
    );

    await dbRun(
      `INSERT INTO logs (action_type, message, timestamp) VALUES (?, ?, ?)`,
      ['SPEAKER_DELETED', `Speaker "${existing.name}" removed from event registry.`, new Date().toISOString()]
    );

    broadcastSpeakerUpdated(null);
    res.json({ success: true, message: 'Speaker deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
