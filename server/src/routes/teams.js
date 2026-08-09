import { Router } from 'express';
import { query } from '../db/pool.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const teams = await query(
      `SELECT id, name, short_name, city, primary_color, secondary_color, coach, founded_year
       FROM teams
       ORDER BY name ASC`
    );
    res.json(teams);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const teams = await query(
      `SELECT id, name, short_name, city, primary_color, secondary_color, coach, founded_year
       FROM teams WHERE id = :id`,
      { id: req.params.id }
    );
    if (!teams.length) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const players = await query(
      `SELECT id, name, jersey_number, position, age
       FROM players WHERE team_id = :id
       ORDER BY jersey_number ASC`,
      { id: req.params.id }
    );

    res.json({ ...teams[0], players });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      name,
      short_name,
      city,
      primary_color = '#00299c',
      secondary_color = '#f3d117',
      coach = null,
      founded_year = null,
    } = req.body;

    if (!name || !short_name || !city) {
      return res.status(400).json({ error: 'name, short_name, and city are required' });
    }

    const result = await query(
      `INSERT INTO teams (name, short_name, city, primary_color, secondary_color, coach, founded_year)
       VALUES (:name, :short_name, :city, :primary_color, :secondary_color, :coach, :founded_year)`,
      { name, short_name, city, primary_color, secondary_color, coach, founded_year }
    );

    res.status(201).json({ id: result.insertId, name, short_name, city });
  } catch (err) {
    next(err);
  }
});

export default router;
