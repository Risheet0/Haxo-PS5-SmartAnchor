import express from 'express';
import { dbGet, dbRun, resetToSeedData, dbAll } from '../config/db.js';
import { broadcastEventUpdated, broadcastSystemReset } from '../services/socketService.js';

const router = express.Router();

/**
 * GET /api/events/current
 * Returns the current active event
 */
router.get('/current', async (req, res, next) => {
  try {
    const event = await dbGet(`SELECT * FROM events WHERE id = 1`);
    if (!event) {
      return res.status(404).json({ error: 'No active event found' });
    }
    res.json(event);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/events/current
 * Updates the current event details
 */
router.put('/current', async (req, res, next) => {
  try {
    const current = await dbGet(`SELECT * FROM events WHERE id = 1`);
    if (!current) {
      return res.status(404).json({ error: 'No active event found' });
    }

    const {
      name = current.name,
      description = current.description,
      organizer_name = current.organizer_name,
      date = current.date,
      start_time = current.start_time,
      end_time = current.end_time,
      venue = current.venue,
      room = current.room,
      status = current.status,
      current_delay_minutes = current.current_delay_minutes
    } = req.body;

    await dbRun(
      `UPDATE events SET
        name = ?,
        description = ?,
        organizer_name = ?,
        date = ?,
        start_time = ?,
        end_time = ?,
        venue = ?,
        room = ?,
        status = ?,
        current_delay_minutes = ?
      WHERE id = 1`,
      [
        name,
        description,
        organizer_name,
        date,
        start_time,
        end_time,
        venue,
        room,
        status,
        Number(current_delay_minutes) || 0
      ]
    );

    const updatedEvent = await dbGet(`SELECT * FROM events WHERE id = 1`);

    // Log the update
    await dbRun(
      `INSERT INTO logs (action_type, message, timestamp) VALUES (?, ?, ?)`,
      ['EVENT_UPDATED', `Event "${updatedEvent.name}" settings were updated.`, new Date().toISOString()]
    );

    broadcastEventUpdated(updatedEvent);
    res.json(updatedEvent);
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

    broadcastSystemReset({ event, agenda, speakers });
    res.json({ message: 'Demo data restored successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
