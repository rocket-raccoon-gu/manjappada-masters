import { Router } from 'express';
import { query } from '../db/pool.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { status, matchday } = req.query;
    const filters = [];
    const params = {};

    if (status) {
      filters.push('m.status = :status');
      params.status = status;
    }
    if (matchday) {
      filters.push('m.matchday = :matchday');
      params.matchday = Number(matchday);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const matches = await query(
      `SELECT
         m.id,
         m.matchday,
         m.kickoff_at,
         m.venue,
         m.status,
         m.home_score,
         m.away_score,
         ht.id AS home_team_id,
         ht.name AS home_team,
         ht.short_name AS home_short,
         ht.primary_color AS home_color,
         at.id AS away_team_id,
         at.name AS away_team,
         at.short_name AS away_short,
         at.primary_color AS away_color
       FROM matches m
       JOIN teams ht ON ht.id = m.home_team_id
       JOIN teams at ON at.id = m.away_team_id
       ${where}
       ORDER BY m.kickoff_at ASC`,
      params
    );

    res.json(matches);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const matches = await query(
      `SELECT
         m.id,
         m.matchday,
         m.kickoff_at,
         m.venue,
         m.status,
         m.home_score,
         m.away_score,
         ht.id AS home_team_id,
         ht.name AS home_team,
         ht.short_name AS home_short,
         at.id AS away_team_id,
         at.name AS away_team,
         at.short_name AS away_short
       FROM matches m
       JOIN teams ht ON ht.id = m.home_team_id
       JOIN teams at ON at.id = m.away_team_id
       WHERE m.id = :id`,
      { id: req.params.id }
    );

    if (!matches.length) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const goals = await query(
      `SELECT g.id, g.minute, g.is_own_goal, g.is_penalty,
              p.name AS player_name, t.name AS team_name, t.id AS team_id
       FROM goals g
       JOIN players p ON p.id = g.player_id
       JOIN teams t ON t.id = g.team_id
       WHERE g.match_id = :id
       ORDER BY g.minute ASC`,
      { id: req.params.id }
    );

    res.json({ ...matches[0], goals });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/score', async (req, res, next) => {
  try {
    const { home_score, away_score, status = 'finished' } = req.body;

    if (home_score == null || away_score == null) {
      return res.status(400).json({ error: 'home_score and away_score are required' });
    }

    await query(
      `UPDATE matches
       SET home_score = :home_score,
           away_score = :away_score,
           status = :status
       WHERE id = :id`,
      { id: req.params.id, home_score, away_score, status }
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
