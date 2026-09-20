import express from 'express';
import { dbAll } from '../config/db.js';

const router = express.Router();

/**
 * GET /api/logs
 * Returns system audit logs ordered by timestamp descending
 */
router.get('/', async (req, res, next) => {
  try {
    const logs = await dbAll(`SELECT * FROM logs ORDER BY id DESC LIMIT 100`);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

export default router;
