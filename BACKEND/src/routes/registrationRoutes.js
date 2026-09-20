import express from 'express';
import { dbGet, dbAll, dbRun, DEFAULT_REGISTRATION_FIELDS } from '../config/db.js';
import {
  broadcastRegistrationFormUpdated,
  broadcastRegistrationSubmitted
} from '../services/socketService.js';

const router = express.Router({ mergeParams: true });

const resolveEventId = (param) => {
  if (!param || param === 'current') return 1;
  const num = Number(param);
  return isNaN(num) ? 1 : num;
};

/**
 * GET /api/events/:id/registration-form
 * Returns the registration form configuration for an event
 */
router.get('/:id/registration-form', async (req, res, next) => {
  try {
    const eventId = resolveEventId(req.params.id);
    let form = await dbGet(`SELECT * FROM registration_forms WHERE event_id = ?`, [eventId]);

    if (!form) {
      // Auto create default form if not present
      await dbRun(
        `INSERT INTO registration_forms (event_id, form_mode, google_form_url, fields_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [eventId, 'custom_form', '', JSON.stringify(DEFAULT_REGISTRATION_FIELDS), new Date().toISOString(), new Date().toISOString()]
      );
      form = await dbGet(`SELECT * FROM registration_forms WHERE event_id = ?`, [eventId]);
    }

    res.json({
      id: form.id,
      event_id: form.event_id,
      form_mode: form.form_mode || 'custom_form',
      google_form_url: form.google_form_url || '',
      fields: JSON.parse(form.fields_json || '[]'),
      updated_at: form.updated_at
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/events/:id/registration-form
 * Event Host (Manager) saves/updates registration form configuration
 */
router.post('/:id/registration-form', async (req, res, next) => {
  try {
    const eventId = resolveEventId(req.params.id);
    const {
      form_mode = 'custom_form',
      google_form_url = '',
      fields = DEFAULT_REGISTRATION_FIELDS
    } = req.body;

    const fieldsJson = typeof fields === 'string' ? fields : JSON.stringify(fields);
    const existing = await dbGet(`SELECT id FROM registration_forms WHERE event_id = ?`, [eventId]);

    if (existing) {
      await dbRun(
        `UPDATE registration_forms SET
          form_mode = ?,
          google_form_url = ?,
          fields_json = ?,
          updated_at = ?
        WHERE event_id = ?`,
        [form_mode, google_form_url, fieldsJson, new Date().toISOString(), eventId]
      );
    } else {
      await dbRun(
        `INSERT INTO registration_forms (event_id, form_mode, google_form_url, fields_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [eventId, form_mode, google_form_url, fieldsJson, new Date().toISOString(), new Date().toISOString()]
      );
    }

    const updated = await dbGet(`SELECT * FROM registration_forms WHERE event_id = ?`, [eventId]);
    const responsePayload = {
      id: updated.id,
      event_id: updated.event_id,
      form_mode: updated.form_mode,
      google_form_url: updated.google_form_url,
      fields: JSON.parse(updated.fields_json || '[]'),
      updated_at: updated.updated_at
    };

    // Log host action
    await dbRun(
      `INSERT INTO logs (action_type, message, timestamp) VALUES (?, ?, ?)`,
      ['REGISTRATION_FORM_UPDATED', `Event #${eventId} registration form settings updated (${form_mode}).`, new Date().toISOString()]
    );

    broadcastRegistrationFormUpdated({ eventId, form: responsePayload });
    res.json(responsePayload);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/events/:id/register
 * User submits registration for an event
 */
router.post('/:id/register', async (req, res, next) => {
  try {
    const eventId = resolveEventId(req.params.id);
    const submission = req.body || {};

    // Retrieve form config to validate required/mandatory fields
    let form = await dbGet(`SELECT * FROM registration_forms WHERE event_id = ?`, [eventId]);
    const fields = form ? JSON.parse(form.fields_json || '[]') : DEFAULT_REGISTRATION_FIELDS;

    // Validate mandatory fields
    const missingFields = [];
    const dataObj = submission.form_data && typeof submission.form_data === 'object' ? { ...submission, ...submission.form_data } : submission;

    for (const field of fields) {
      if (field.required) {
        const val = dataObj[field.id] || dataObj[field.label] || dataObj[field.id.replace(/_/g, '')];
        if (!val || String(val).trim() === '') {
          missingFields.push(field.label || field.id);
        }
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Mandatory fields missing: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    const userName = dataObj.full_name || dataObj.name || dataObj.fullName || dataObj.user_name || dataObj.userName || 'Attendee';
    const userEmail = dataObj.email || dataObj.userEmail || dataObj.user_email || '';
    const registrationCode = `TF26-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const result = await dbRun(
      `INSERT INTO registrations (
        event_id, user_name, user_email, form_data_json, registration_code, status, registered_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        eventId,
        userName,
        userEmail,
        JSON.stringify(submission),
        registrationCode,
        'CONFIRMED',
        new Date().toISOString()
      ]
    );

    const newRecord = await dbGet(`SELECT * FROM registrations WHERE id = ?`, [result.lastID]);

    const registrationPayload = {
      id: newRecord.id,
      event_id: newRecord.event_id,
      user_name: newRecord.user_name,
      user_email: newRecord.user_email,
      registration_code: newRecord.registration_code,
      status: newRecord.status,
      form_data: JSON.parse(newRecord.form_data_json || '{}'),
      registered_at: newRecord.registered_at
    };

    // Log registration
    await dbRun(
      `INSERT INTO logs (action_type, message, timestamp) VALUES (?, ?, ?)`,
      ['ATTENDEE_REGISTERED', `Attendee "${userName}" registered (Pass: ${registrationCode}).`, new Date().toISOString()]
    );

    broadcastRegistrationSubmitted(registrationPayload);
    res.status(201).json(registrationPayload);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/events/:id/registrations
 * Event Host retrieves registered attendees list
 */
router.get('/:id/registrations', async (req, res, next) => {
  try {
    const eventId = resolveEventId(req.params.id);
    const rows = await dbAll(`SELECT * FROM registrations WHERE event_id = ? ORDER BY id DESC`, [eventId]);

    const attendees = rows.map((r) => ({
      id: r.id,
      event_id: r.event_id,
      user_name: r.user_name,
      user_email: r.user_email,
      registration_code: r.registration_code,
      status: r.status,
      form_data: JSON.parse(r.form_data_json || '{}'),
      registered_at: r.registered_at
    }));

    res.json(attendees);
  } catch (err) {
    next(err);
  }
});

export default router;
