import express from 'express';
import { dbAll, dbGet, dbRun } from '../config/db.js';
import { shiftTimeString } from '../utils/timeUtils.js';
import {
  broadcastAgendaUpdated,
  broadcastAgendaReordered,
  broadcastActivityStatusChanged,
  broadcastDelayAdded
} from '../services/socketService.js';

const router = express.Router();

/**
 * GET /api/agenda
 * List all agenda activities ordered by order_index
 */
router.get('/', async (req, res, next) => {
  try {
    const items = await dbAll(`SELECT * FROM agenda ORDER BY order_index ASC`);
    res.json(items);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/agenda
 * Create a new agenda session/activity
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      title = 'Untitled Session',
      activity_type = 'Session',
      start_time = '10:00 AM',
      end_time = '10:45 AM',
      duration_minutes = 45,
      room = 'Main Auditorium',
      status = 'UPCOMING',
      speaker_id = null,
      notes = ''
    } = req.body;

    let speakerName = null;
    let speakerOrg = null;
    let speakerDesignation = null;

    if (speaker_id) {
      const speaker = await dbGet(`SELECT * FROM speakers WHERE id = ?`, [Number(speaker_id)]);
      if (speaker) {
        speakerName = speaker.name;
        speakerOrg = speaker.organization;
        speakerDesignation = speaker.designation;
      }
    }

    const countRow = await dbGet(`SELECT COUNT(*) as count FROM agenda`);
    const nextOrder = (countRow?.count || 0) + 1;

    const result = await dbRun(
      `INSERT INTO agenda (
        order_index, title, activity_type, start_time, end_time, duration_minutes,
        room, status, speaker_id, speaker_name, speaker_org, speaker_designation, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextOrder,
        title,
        activity_type,
        start_time,
        end_time,
        Number(duration_minutes) || 45,
        room,
        status,
        speaker_id ? Number(speaker_id) : null,
        speakerName,
        speakerOrg,
        speakerDesignation,
        notes,
        new Date().toISOString()
      ]
    );

    const newItem = await dbGet(`SELECT * FROM agenda WHERE id = ?`, [result.lastID]);
    const allAgenda = await dbAll(`SELECT * FROM agenda ORDER BY order_index ASC`);

    await dbRun(
      `INSERT INTO logs (action_type, message, timestamp) VALUES (?, ?, ?)`,
      ['SESSION_CREATED', `Created new agenda session "${newItem.title}".`, new Date().toISOString()]
    );

    broadcastAgendaUpdated(allAgenda);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/agenda/:id
 * Update an existing agenda session
 */
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await dbGet(`SELECT * FROM agenda WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Agenda activity not found' });
    }

    const {
      title = existing.title,
      activity_type = existing.activity_type,
      start_time = existing.start_time,
      end_time = existing.end_time,
      duration_minutes = existing.duration_minutes,
      room = existing.room,
      status = existing.status,
      speaker_id = existing.speaker_id,
      notes = existing.notes
    } = req.body;

    let speakerName = existing.speaker_name;
    let speakerOrg = existing.speaker_org;
    let speakerDesignation = existing.speaker_designation;

    if (speaker_id && Number(speaker_id) !== Number(existing.speaker_id)) {
      const speaker = await dbGet(`SELECT * FROM speakers WHERE id = ?`, [Number(speaker_id)]);
      if (speaker) {
        speakerName = speaker.name;
        speakerOrg = speaker.organization;
        speakerDesignation = speaker.designation;
      }
    } else if (speaker_id === null || speaker_id === '') {
      speakerName = null;
      speakerOrg = null;
      speakerDesignation = null;
    }

    await dbRun(
      `UPDATE agenda SET
        title = ?,
        activity_type = ?,
        start_time = ?,
        end_time = ?,
        duration_minutes = ?,
        room = ?,
        status = ?,
        speaker_id = ?,
        speaker_name = ?,
        speaker_org = ?,
        speaker_designation = ?,
        notes = ?
      WHERE id = ?`,
      [
        title,
        activity_type,
        start_time,
        end_time,
        Number(duration_minutes) || 45,
        room,
        status,
        speaker_id ? Number(speaker_id) : null,
        speakerName,
        speakerOrg,
        speakerDesignation,
        notes,
        id
      ]
    );

    const updatedItem = await dbGet(`SELECT * FROM agenda WHERE id = ?`, [id]);
    const allAgenda = await dbAll(`SELECT * FROM agenda ORDER BY order_index ASC`);

    broadcastAgendaUpdated(allAgenda);
    res.json(updatedItem);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/agenda/:id
 * Delete an agenda item
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const item = await dbGet(`SELECT * FROM agenda WHERE id = ?`, [id]);
    if (!item) {
      return res.status(404).json({ error: 'Agenda activity not found' });
    }

    await dbRun(`DELETE FROM agenda WHERE id = ?`, [id]);

    // Renumber order_index
    const remaining = await dbAll(`SELECT * FROM agenda ORDER BY order_index ASC`);
    for (let i = 0; i < remaining.length; i++) {
      await dbRun(`UPDATE agenda SET order_index = ? WHERE id = ?`, [i + 1, remaining[i].id]);
    }

    await dbRun(
      `INSERT INTO logs (action_type, message, timestamp) VALUES (?, ?, ?)`,
      ['SESSION_DELETED', `Removed session "${item.title}".`, new Date().toISOString()]
    );

    const updatedAgenda = await dbAll(`SELECT * FROM agenda ORDER BY order_index ASC`);
    broadcastAgendaUpdated(updatedAgenda);
    res.json({ success: true, message: 'Activity deleted' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/agenda/:id/status
 * Transition session lifecycle status (UPCOMING, LIVE, COMPLETED, DELAYED, OVERRUN)
 */
router.post('/:id/status', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const item = await dbGet(`SELECT * FROM agenda WHERE id = ?`, [id]);
    if (!item) {
      return res.status(404).json({ error: 'Agenda activity not found' });
    }

    await dbRun(`UPDATE agenda SET status = ? WHERE id = ?`, [status, id]);

    const allItems = await dbAll(`SELECT * FROM agenda ORDER BY order_index ASC`);

    await dbRun(
      `INSERT INTO logs (action_type, message, timestamp) VALUES (?, ?, ?)`,
      [`SESSION_${status}`, `Session "${item.title}" transitioned to ${status}.`, new Date().toISOString()]
    );

    broadcastActivityStatusChanged({ allItems, targetId: id, status });
    res.json({ success: true, status, allItems });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/agenda/delay
 * Inject dynamic delay with cascading propagation downstream
 */
router.post('/delay', async (req, res, next) => {
  try {
    const { minutes, targetActivityId, reason = 'Stage delay adjustment' } = req.body;
    const delta = Number(minutes) || 0;

    if (!delta) {
      return res.status(400).json({ error: 'Valid minutes parameter required' });
    }

    const agenda = await dbAll(`SELECT * FROM agenda ORDER BY order_index ASC`);
    const pivotIdx = agenda.findIndex((a) => String(a.id) === String(targetActivityId));
    const startIndex = pivotIdx >= 0 ? pivotIdx : 0;

    // Shift timings for pivot and downstream activities
    for (let i = startIndex; i < agenda.length; i++) {
      const item = agenda[i];
      const newStart = shiftTimeString(item.start_time, delta);
      const newEnd = shiftTimeString(item.end_time, delta);
      const newStatus = item.status === 'UPCOMING' ? 'DELAYED' : item.status;

      await dbRun(
        `UPDATE agenda SET start_time = ?, end_time = ?, status = ? WHERE id = ?`,
        [newStart, newEnd, newStatus, item.id]
      );
    }

    // Update cumulative event delay
    const event = await dbGet(`SELECT * FROM events WHERE id = 1`);
    const newDelay = (event?.current_delay_minutes || 0) + delta;
    await dbRun(`UPDATE events SET current_delay_minutes = ? WHERE id = 1`, [newDelay]);

    const updatedEvent = await dbGet(`SELECT * FROM events WHERE id = 1`);
    const updatedAgenda = await dbAll(`SELECT * FROM agenda ORDER BY order_index ASC`);

    await dbRun(
      `INSERT INTO logs (action_type, message, timestamp) VALUES (?, ?, ?)`,
      ['DELAY_ADDED', `Injected +${delta}m delay starting at session #${startIndex + 1} (${reason}).`, new Date().toISOString()]
    );

    broadcastDelayAdded({
      event: updatedEvent,
      agenda: updatedAgenda,
      minutes: delta,
      targetActivityId,
      reason
    });

    res.json({
      success: true,
      minutes: delta,
      targetActivityId,
      event: updatedEvent,
      agenda: updatedAgenda
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/agenda/reorder
 * Save reordered agenda sequence
 */
router.post('/reorder', async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items array is required' });
    }

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      await dbRun(
        `UPDATE agenda SET order_index = ? WHERE id = ?`,
        [idx + 1, Number(item.id)]
      );
    }

    const reorderedAgenda = await dbAll(`SELECT * FROM agenda ORDER BY order_index ASC`);

    await dbRun(
      `INSERT INTO logs (action_type, message, timestamp) VALUES (?, ?, ?)`,
      ['AGENDA_REORDERED', 'Agenda schedule reordered by stage operator.', new Date().toISOString()]
    );

    broadcastAgendaReordered(reorderedAgenda);
    res.json({ success: true, agenda: reorderedAgenda });
  } catch (err) {
    next(err);
  }
});

export default router;
