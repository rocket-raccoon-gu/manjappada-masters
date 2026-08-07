import { Router } from 'express';
import { query } from '../db/pool.js';

const router = Router();

router.get('/scorers', async (_req, res, next) => {
  try {
    const scorers = await query(
      `SELECT
         p.id,
         p.name,
         p.jersey_number,
         t.id AS team_id,
         t.name AS team_name,
         t.short_name AS team_short,
         COUNT(*) AS goals
       FROM goals g
       JOIN players p ON p.id = g.player_id
       JOIN teams t ON t.id = g.team_id
       WHERE g.is_own_goal = 0
       GROUP BY p.id, p.name, p.jersey_number, t.id, t.name, t.short_name
       ORDER BY goals DESC, p.name ASC
       LIMIT 10`
    );

    res.json(scorers.map((s) => ({ ...s, goals: Number(s.goals) })));
  } catch (err) {
    next(err);
  }
});

export default router;
