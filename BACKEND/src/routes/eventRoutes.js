import express from 'express';
import { dbGet, dbRun, resetToSeedData, dbAll, DEFAULT_REGISTRATION_FIELDS } from '../config/db.js';
import {
  broadcastEventUpdated,
  broadcastNewEventLaunched,
  broadcastSystemReset
} from '../services/socketService.js';

const router = express.Router();

/**
 * Format event object helper
 */
const formatEvent = (e) => {
  if (!e) return null;
  return {
    id: e.id,
    name: e.name || e.title || 'Untitled Event',
    title: e.title || e.name || 'Untitled Event',
    description: e.description || '',
    organizer_name: e.organizer_name || e.organizer || 'Event Organizer',
    organizer: e.organizer || e.organizer_name || 'Event Organizer',
    organizer_type: e.organizer_type || 'Organization',
    organizerType: e.organizer_type || 'Organization',
    category: e.category || 'Technology',
    date: e.date || new Date().toISOString().split('T')[0],
    start_time: e.start_time || '09:00 AM',
    startTime: e.start_time || '09:00 AM',
    end_time: e.end_time || '06:00 PM',
    endTime: e.end_time || '06:00 PM',
    venue: e.venue || 'Grand Convention Center',
    room: e.room || 'Main Auditorium',
    city: e.city || 'Ahmedabad',
    location: e.location || e.venue || 'Ahmedabad, Gujarat',
    image: e.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    capacity: e.capacity || 500,
    eligibility: e.eligibility || 'Open to all students and attendees',
    registration_status: e.registration_status || 'OPEN',
    registrationStatus: e.registration_status || 'OPEN',
    registration_deadline: e.registration_deadline || '',
    registrationDeadline: e.registration_deadline || '',
    status: e.status || 'UPCOMING',
    current_delay_minutes: e.current_delay_minutes || 0,
    created_at: e.created_at || new Date().toISOString()
  };
};

/**
 * GET /api/events
 * Returns all events in the system
 */
router.get('/', async (req, res, next) => {
  try {
    const events = await dbAll(`SELECT * FROM events ORDER BY id ASC`);
    res.json(events.map(formatEvent));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/events/current
 * Returns the current active event
 */
router.get('/current', async (req, res, next) => {
  try {
    let event = await dbGet(`SELECT * FROM events WHERE status = 'LIVE' ORDER BY id DESC LIMIT 1`);
    if (!event) {
      event = await dbGet(`SELECT * FROM events ORDER BY id ASC LIMIT 1`);
    }
    if (!event) {
      return res.status(404).json({ error: 'No active event found' });
    }
    res.json(formatEvent(event));
  } catch (err) {
    next(err);
  }
});

/**
 * Helper to resolve event by integer ID, string ID, slug, or title
 */
async function resolveEvent(paramId) {
  if (!paramId) return null;
  let event = await dbGet(`SELECT * FROM events WHERE id = ? OR LOWER(name) = ? OR LOWER(title) = ?`, [
    paramId,
    String(paramId).toLowerCase(),
    String(paramId).toLowerCase()
  ]);
  if (!event && /^\d+$/.test(String(paramId))) {
    event = await dbGet(`SELECT * FROM events WHERE id = ?`, [Number(paramId)]);
  }
  if (!event) {
    const cleaned = String(paramId).replace(/^(event_|events_|ev-)/i, '');
    if (/^\d+$/.test(cleaned)) {
      event = await dbGet(`SELECT * FROM events WHERE id = ?`, [Number(cleaned)]);
    } else {
      event = await dbGet(`SELECT * FROM events WHERE LOWER(name) LIKE ? OR LOWER(title) LIKE ?`, [
        `%${cleaned.toLowerCase()}%`,
        `%${cleaned.toLowerCase()}%`
      ]);
    }
  }
  return event;
}

/**
 * GET /api/events/:id/speaker-console
 * Protected Speaker Console endpoint with strict backend 403 authorization check
 */
router.get('/:id/speaker-console', async (req, res, next) => {
  try {
    const { id } = req.params;
    const authEmail =
      req.headers['x-user-email'] ||
      req.headers['x-manager-email'] ||
      req.query.email;

    if (!authEmail) {
      return res.status(401).json({
        success: false,
        message: '401 Unauthorized: Authentication header required.'
      });
    }

    const normalizedEmail = String(authEmail).trim().toLowerCase();
    const user = await dbGet(`SELECT * FROM users WHERE LOWER(email) = ?`, [normalizedEmail]);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '401 Unauthorized: User identity not found.'
      });
    }

    const event = await resolveEvent(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event Not Found: The requested event could not be found.'
      });
    }

    // Backend Authorization Check: Ensure speaker's assigned event matches requested event
    if (user.role === 'speaker' && String(user.event_id || 1) !== String(event.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have permission to access this event.'
      });
    }

    // Inactive Event Check
    if (event.status && ['INACTIVE', 'CLOSED', 'ARCHIVED'].includes(event.status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Event ${event.status}: This event is currently ${event.status.toLowerCase()} and cannot be accessed.`
      });
    }

    const formattedEvent = formatEvent(event);
    const agenda = await dbAll(`SELECT * FROM agenda ORDER BY order_index ASC`);
    const speakers = await dbAll(`SELECT * FROM speakers ORDER BY id ASC`);
    const announcements = await dbAll(`SELECT * FROM announcements ORDER BY id DESC`);

    return res.status(200).json({
      success: true,
      event: formattedEvent,
      agenda,
      speakers,
      announcements
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/events/:id
 * Returns a specific event by ID with authorization checks
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === 'current') {
      const event = await dbGet(`SELECT * FROM events WHERE id = 1`);
      return res.json(formatEvent(event));
    }

    const event = await resolveEvent(id);
    if (!event) {
      return res.status(404).json({ error: `Event with ID "${id}" not found` });
    }

    // Check authorization for speaker role if user header present
    const authEmail = req.headers['x-user-email'] || req.headers['x-manager-email'];
    if (authEmail) {
      const user = await dbGet(`SELECT * FROM users WHERE LOWER(email) = ?`, [String(authEmail).trim().toLowerCase()]);
      if (user && user.role === 'speaker' && String(user.event_id || 1) !== String(event.id)) {
        return res.status(403).json({
          error: '403 Forbidden',
          message: 'Access Denied: You do not have permission to access this event.'
        });
      }
    }

    res.json(formatEvent(event));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/events
 * Event Host launches/creates a new event
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      name,
      title,
      description = '',
      organizer_name,
      organizer,
      organizer_type = 'Organization',
      category = 'Technology',
      date = new Date().toISOString().split('T')[0],
      start_time = '09:00 AM',
      startTime,
      end_time = '06:00 PM',
      endTime,
      venue = 'Main Convention Center',
      room = 'Main Hall',
      city = 'Ahmedabad',
      location = '',
      image = '',
      capacity = 500,
      eligibility = 'Open to all students & participants',
      status = 'LIVE',
      registration_deadline = ''
    } = req.body;

    const eventTitle = title || name || 'New Launched Event';
    const orgName = organizer || organizer_name || 'Event Host Committee';
    const sTime = startTime || start_time;
    const eTime = endTime || end_time;

    const result = await dbRun(
      `INSERT INTO events (
        name, title, description, organizer_name, organizer, organizer_type,
        category, date, start_time, end_time, venue, room, city, location,
        image, capacity, eligibility, registration_status, registration_deadline,
        status, current_delay_minutes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventTitle,
        eventTitle,
        description,
        orgName,
        orgName,
        organizer_type,
        category,
        date,
        sTime,
        eTime,
        venue,
        room,
        city,
        location || `${venue}, ${city}`,
        image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        Number(capacity) || 500,
        eligibility,
        'OPEN',
        registration_deadline,
        status,
        0,
        new Date().toISOString()
      ]
    );

    const createdEventId = result.lastID;

    // Create default registration form config for this new event
    await dbRun(
      `INSERT INTO registration_forms (event_id, form_mode, google_form_url, fields_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        createdEventId,
        'custom_form',
        '',
        JSON.stringify(DEFAULT_REGISTRATION_FIELDS),
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );

    const newEvent = await dbGet(`SELECT * FROM events WHERE id = ?`, [createdEventId]);
    const formatted = formatEvent(newEvent);

    // Log host action
    await dbRun(
      `INSERT INTO logs (action_type, message, timestamp) VALUES (?, ?, ?)`,
      ['EVENT_LAUNCHED', `Host created and launched new event "${eventTitle}" (#${createdEventId}).`, new Date().toISOString()]
    );

    broadcastNewEventLaunched(formatted);
    res.status(201).json(formatted);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/events/:id or /current
 * Updates event details
 */
router.put('/:id', async (req, res, next) => {
  try {
    const eventId = req.params.id === 'current' ? 1 : req.params.id;
    const current = await dbGet(`SELECT * FROM events WHERE id = ?`, [eventId]);

    if (!current) {
      return res.status(404).json({ error: `Event with ID "${eventId}" not found` });
    }

    const {
      name = current.name,
      title = current.title || current.name,
      description = current.description,
      organizer_name = current.organizer_name,
      organizer = current.organizer || current.organizer_name,
      organizer_type = current.organizer_type || 'Organization',
      category = current.category || 'Technology',
      date = current.date,
      start_time = current.start_time,
      end_time = current.end_time,
      venue = current.venue,
      room = current.room,
      city = current.city || 'Ahmedabad',
      location = current.location,
      image = current.image,
      capacity = current.capacity,
      eligibility = current.eligibility,
      status = current.status,
      current_delay_minutes = current.current_delay_minutes
    } = req.body;

    await dbRun(
      `UPDATE events SET
        name = ?,
        title = ?,
        description = ?,
        organizer_name = ?,
        organizer = ?,
        organizer_type = ?,
        category = ?,
        date = ?,
        start_time = ?,
        end_time = ?,
        venue = ?,
        room = ?,
        city = ?,
        location = ?,
        image = ?,
        capacity = ?,
        eligibility = ?,
        status = ?,
        current_delay_minutes = ?
      WHERE id = ?`,
      [
        title || name,
        title || name,
        description,
        organizer || organizer_name,
        organizer || organizer_name,
        organizer_type,
        category,
        date,
        start_time,
        end_time,
        venue,
        room,
        city,
        location || venue,
        image || current.image,
        Number(capacity) || current.capacity || 500,
        eligibility,
        status,
        Number(current_delay_minutes) || 0,
        eventId
      ]
    );

    const updatedEvent = await dbGet(`SELECT * FROM events WHERE id = ?`, [eventId]);
    const formatted = formatEvent(updatedEvent);

    // Log the update
    await dbRun(
      `INSERT INTO logs (action_type, message, timestamp) VALUES (?, ?, ?)`,
      ['EVENT_UPDATED', `Event "${formatted.title}" settings were updated.`, new Date().toISOString()]
    );

    broadcastEventUpdated(formatted);
    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/events/reset-demo
 * Resets database back to default TechFest 2026 data
 */
router.post('/reset-demo', async (req, res, next) => {
  try {
    await resetToSeedData();
    const event = await dbGet(`SELECT * FROM events WHERE id = 1`);
    const agenda = await dbAll(`SELECT * FROM agenda ORDER BY order_index ASC`);
    const speakers = await dbAll(`SELECT * FROM speakers ORDER BY id ASC`);

    broadcastSystemReset({ event: formatEvent(event), agenda, speakers });
    res.json({ message: 'Demo data restored successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
