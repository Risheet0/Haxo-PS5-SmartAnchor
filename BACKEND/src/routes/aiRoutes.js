import express from 'express';
import { dbGet, dbRun } from '../config/db.js';
import { synthesizeStageScript } from '../services/geminiService.js';

const router = express.Router();

/**
 * POST /api/ai/generate
 * Synthesizes a contextual stage script via Google Gemini AI
 */
router.post('/generate', async (req, res, next) => {
  try {
    const payload = req.body || {};
    const event = await dbGet(`SELECT * FROM events WHERE id = 1`);

    // If speakerId provided, enrich payload
    if (payload.speakerId) {
      const speaker = await dbGet(`SELECT * FROM speakers WHERE id = ?`, [Number(payload.speakerId)]);
      if (speaker) {
        payload.speakerName = payload.speakerName || speaker.name;
        payload.speakerOrg = payload.speakerOrg || speaker.organization;
        payload.speakerDesig = payload.speakerDesig || speaker.designation;
        payload.speakerBio = payload.speakerBio || speaker.bio;
        payload.speakerTopic = payload.topic || speaker.topic;
      }
    }

    // If transition activity IDs provided, enrich activity titles
    if (payload.currentActivityId) {
      const curr = await dbGet(`SELECT title FROM agenda WHERE id = ?`, [Number(payload.currentActivityId)]);
      if (curr) payload.currentActivityTitle = curr.title;
    }
    if (payload.nextActivityId) {
      const nxt = await dbGet(`SELECT title FROM agenda WHERE id = ?`, [Number(payload.nextActivityId)]);
      if (nxt) payload.nextActivityTitle = nxt.title;
    }

    const result = await synthesizeStageScript(payload, event);

    // Save to AI scripts archive in DB
    try {
      await dbRun(
        `INSERT INTO ai_scripts (
          title, script, script_type, tone, length, speaker_id, provider, word_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payload.topic || payload.scriptType || 'Stage Script',
          result.script,
          result.scriptType,
          result.tone,
          result.length,
          payload.speakerId ? Number(payload.speakerId) : null,
          result.provider,
          result.wordCount,
          new Date().toISOString()
        ]
      );
    } catch (archiveErr) {
      console.warn('[AI Route] Failed to archive generated script:', archiveErr.message);
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai/emergency
 * Generates an emergency stage announcement
 */
router.post('/emergency', async (req, res, next) => {
  try {
    const payload = {
      scriptType: 'Emergency Announcement',
      customNotes: req.body?.rawNote || req.body?.notes || 'Please remain calm.',
      tone: 'Formal',
      length: 'Short'
    };

    const event = await dbGet(`SELECT * FROM events WHERE id = 1`);
    const result = await synthesizeStageScript(payload, event);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
