import { Router } from 'express';
import { query } from '../db/pool.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT id, name, season, venue, start_date, end_date, status
       FROM tournament
       ORDER BY id DESC
       LIMIT 1`
    );
    res.json(rows[0] || null);
  } catch (err) {
    next(err);
  }
});

export default router;
