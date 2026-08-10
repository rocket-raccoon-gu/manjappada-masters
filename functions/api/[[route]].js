import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

const app = new Hono().basePath('/api');

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

app.get('/health', async (c) => {
  try {
    await c.env.DB.prepare('SELECT 1 AS ok').first();
    return c.json({ ok: true, service: 'manjappada-masters-api', db: 'up' });
  } catch (err) {
    return c.json(
      { ok: false, service: 'manjappada-masters-api', db: 'down', error: err.message },
      503
    );
  }
});

app.get('/tournament', async (c) => {
  const row = await c.env.DB.prepare(
    `SELECT id, name, season, venue, start_date, end_date, status
     FROM tournament
     ORDER BY id DESC
     LIMIT 1`
  ).first();
  return c.json(row || null);
});

app.get('/teams', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, name, short_name, city, primary_color, secondary_color, coach, founded_year
     FROM teams
     ORDER BY name ASC`
  ).all();
  return c.json(results);
});

app.get('/teams/:id', async (c) => {
  const id = c.req.param('id');
  const team = await c.env.DB.prepare(
    `SELECT id, name, short_name, city, primary_color, secondary_color, coach, founded_year
     FROM teams WHERE id = ?`
  )
    .bind(id)
    .first();

  if (!team) {
    return c.json({ error: 'Team not found' }, 404);
  }

  const { results: players } = await c.env.DB.prepare(
    `SELECT id, name, jersey_number, position, age
     FROM players WHERE team_id = ?
     ORDER BY jersey_number ASC`
  )
    .bind(id)
    .all();

  return c.json({ ...team, players });
});

app.post('/teams', async (c) => {
  const body = await c.req.json();
  const {
    name,
    short_name,
    city,
    primary_color = '#00299c',
    secondary_color = '#f3d117',
    coach = null,
    founded_year = null,
  } = body;

  if (!name || !short_name || !city) {
    return c.json({ error: 'name, short_name, and city are required' }, 400);
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO teams (name, short_name, city, primary_color, secondary_color, coach, founded_year)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(name, short_name, city, primary_color, secondary_color, coach, founded_year)
    .run();

  return c.json({ id: result.meta.last_row_id, name, short_name, city }, 201);
});

app.get('/matches', async (c) => {
  const status = c.req.query('status');
  const matchday = c.req.query('matchday');
  const filters = [];
  const params = [];

  if (status) {
    filters.push('m.status = ?');
    params.push(status);
  }
  if (matchday) {
    filters.push('m.matchday = ?');
    params.push(Number(matchday));
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const statement = c.env.DB.prepare(
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
     ORDER BY m.kickoff_at ASC`
  );

  const { results } = params.length ? await statement.bind(...params).all() : await statement.all();
  return c.json(results);
});

app.get('/matches/:id', async (c) => {
  const id = c.req.param('id');
  const match = await c.env.DB.prepare(
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
     WHERE m.id = ?`
  )
    .bind(id)
    .first();

  if (!match) {
    return c.json({ error: 'Match not found' }, 404);
  }

  const { results: goals } = await c.env.DB.prepare(
    `SELECT g.id, g.minute, g.is_own_goal, g.is_penalty,
            p.name AS player_name, t.name AS team_name, t.id AS team_id
     FROM goals g
     JOIN players p ON p.id = g.player_id
     JOIN teams t ON t.id = g.team_id
     WHERE g.match_id = ?
     ORDER BY g.minute ASC`
  )
    .bind(id)
    .all();

  return c.json({ ...match, goals });
});

app.patch('/matches/:id/score', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { home_score, away_score, status = 'finished' } = body;

  if (home_score == null || away_score == null) {
    return c.json({ error: 'home_score and away_score are required' }, 400);
  }

  await c.env.DB.prepare(
    `UPDATE matches
     SET home_score = ?,
         away_score = ?,
         status = ?
     WHERE id = ?`
  )
    .bind(home_score, away_score, status, id)
    .run();

  return c.json({ ok: true });
});

app.get('/standings', async (c) => {
  const { results: rows } = await c.env.DB.prepare(
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
  ).all();

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

  return c.json(standings);
});

app.get('/players/scorers', async (c) => {
  const { results } = await c.env.DB.prepare(
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
  ).all();

  return c.json(results.map((s) => ({ ...s, goals: Number(s.goals) })));
});

export const onRequest = handle(app);
