import { Router } from 'express';
import { query } from '../db/pool.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT * FROM (
         SELECT
           t.id,
           t.name,
           t.short_name,
           t.primary_color,
           COALESCE(SUM(
             CASE
               WHEN m.status = 'finished' AND m.home_team_id = t.id AND m.home_score > m.away_score THEN 3
               WHEN m.status = 'finished' AND m.away_team_id = t.id AND m.away_score > m.home_score THEN 3
               WHEN m.status = 'finished' AND (
                 (m.home_team_id = t.id OR m.away_team_id = t.id) AND m.home_score = m.away_score
               ) THEN 1
               ELSE 0
             END
           ), 0) AS points,
           COALESCE(SUM(
             CASE WHEN m.status = 'finished' AND (m.home_team_id = t.id OR m.away_team_id = t.id) THEN 1 ELSE 0 END
           ), 0) AS played,
           COALESCE(SUM(
             CASE
               WHEN m.status = 'finished' AND m.home_team_id = t.id AND m.home_score > m.away_score THEN 1
               WHEN m.status = 'finished' AND m.away_team_id = t.id AND m.away_score > m.home_score THEN 1
               ELSE 0
             END
           ), 0) AS won,
           COALESCE(SUM(
             CASE
               WHEN m.status = 'finished' AND (m.home_team_id = t.id OR m.away_team_id = t.id)
                    AND m.home_score = m.away_score THEN 1
               ELSE 0
             END
           ), 0) AS drawn,
           COALESCE(SUM(
             CASE
               WHEN m.status = 'finished' AND m.home_team_id = t.id AND m.home_score < m.away_score THEN 1
               WHEN m.status = 'finished' AND m.away_team_id = t.id AND m.away_score < m.home_score THEN 1
               ELSE 0
             END
           ), 0) AS lost,
           COALESCE(SUM(
             CASE
               WHEN m.status = 'finished' AND m.home_team_id = t.id THEN m.home_score
               WHEN m.status = 'finished' AND m.away_team_id = t.id THEN m.away_score
               ELSE 0
             END
           ), 0) AS goals_for,
           COALESCE(SUM(
             CASE
               WHEN m.status = 'finished' AND m.home_team_id = t.id THEN m.away_score
               WHEN m.status = 'finished' AND m.away_team_id = t.id THEN m.home_score
               ELSE 0
             END
           ), 0) AS goals_against
         FROM teams t
         LEFT JOIN matches m
           ON (m.home_team_id = t.id OR m.away_team_id = t.id)
         GROUP BY t.id, t.name, t.short_name, t.primary_color
       ) AS standings
       ORDER BY points DESC, (goals_for - goals_against) DESC, goals_for DESC, name ASC`
    );

    const standings = rows.map((row, index) => ({
      position: index + 1,
      ...row,
      points: Number(row.points),
      played: Number(row.played),
      won: Number(row.won),
      drawn: Number(row.drawn),
      lost: Number(row.lost),
      goals_for: Number(row.goals_for),
      goals_against: Number(row.goals_against),
      goal_difference: Number(row.goals_for) - Number(row.goals_against),
    }));

    res.json(standings);
  } catch (err) {
    next(err);
  }
});

export default router;
