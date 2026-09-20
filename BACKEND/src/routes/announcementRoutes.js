import express from 'express';
import { dbAll, dbGet, dbRun } from '../config/db.js';
import {
  broadcastEmergencyAnnouncement,
  broadcastAnnouncementDismissed
} from '../services/socketService.js';

const router = express.Router();

/**
 * GET /api/announcements
 * Returns all active announcements (or all announcements)
 */
router.get('/', async (req, res, next) => {
  try {
    const announcements = await dbAll(`SELECT * FROM announcements ORDER BY id DESC`);
    res.json(announcements);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/announcements
 * Broadcasts and records a new stage/emergency announcement
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      original_prompt = '',
      ai_script = '',
      priority = 'urgent',
      is_active = 1
    } = req.body;

    const result = await dbRun(
      `INSERT INTO announcements (original_prompt, ai_script, priority, is_active, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        original_prompt,
        ai_script || original_prompt,
        priority,
        is_active ? 1 : 0,
        new Date().toISOString()
      ]
    );

    const newAnnouncement = await dbGet(`SELECT * FROM announcements WHERE id = ?`, [result.lastID]);

    await dbRun(
      `INSERT INTO logs (action_type, message, timestamp) VALUES (?, ?, ?)`,
      ['ANNOUNCEMENT_BROADCAST', `Emergency broadcast: "${original_prompt.slice(0, 60)}..."`, new Date().toISOString()]
    );

    broadcastEmergencyAnnouncement(newAnnouncement);
    res.status(201).json(newAnnouncement);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/announcements/:id/dismiss
 * Dismisses an announcement
 */
router.post('/:id/dismiss', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await dbGet(`SELECT * FROM announcements WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    await dbRun(`UPDATE announcements SET is_active = 0 WHERE id = ?`, [id]);

    await dbRun(
      `INSERT INTO logs (action_type, message, timestamp) VALUES (?, ?, ?)`,
      ['ANNOUNCEMENT_DISMISSED', `Dismissed announcement #${id}.`, new Date().toISOString()]
    );

    broadcastAnnouncementDismissed({ id });
    res.json({ success: true, id, message: 'Announcement dismissed' });
  } catch (err) {
    next(err);
  }
});

export default router;
