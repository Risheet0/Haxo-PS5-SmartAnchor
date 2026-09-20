import express from 'express';
import { dbAll, dbGet, dbRun } from '../config/db.js';
import { broadcastSpeakerUpdated } from '../services/socketService.js';

const router = express.Router();

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
 * POST /api/speakers
 * Creates a new speaker profile
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      name = 'Anonymous Dignitary',
      designation = 'Special Guest',
      organization = 'Industry Partner',
      bio = '',
      topic = '',
      avatar_url = ''
    } = req.body;

    const result = await dbRun(
      `INSERT INTO speakers (name, designation, organization, bio, topic, avatar_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, designation, organization, bio, topic, avatar_url, new Date().toISOString()]
    );

    const newSpeaker = await dbGet(`SELECT * FROM speakers WHERE id = ?`, [result.lastID]);

    await dbRun(
      `INSERT INTO logs (action_type, message, timestamp) VALUES (?, ?, ?)`,
      ['SPEAKER_ADDED', `Speaker "${newSpeaker.name}" registered.`, new Date().toISOString()]
    );

    broadcastSpeakerUpdated(newSpeaker);
    res.status(201).json(newSpeaker);
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
      designation = existing.designation,
      organization = existing.organization,
      bio = existing.bio,
      topic = existing.topic,
      avatar_url = existing.avatar_url
    } = req.body;

    await dbRun(
      `UPDATE speakers SET
        name = ?,
        designation = ?,
        organization = ?,
        bio = ?,
        topic = ?,
        avatar_url = ?
      WHERE id = ?`,
      [name, designation, organization, bio, topic, avatar_url, id]
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
