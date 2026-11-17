import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { createAdminToken, requireAdmin, getSetting, setSetting } from '../_lib/auth.js';

const MATCH_STATUSES = ['scheduled', 'live', 'finished', 'postponed'];

function shortNameFrom(name) {
  const letters = String(name || '').replace(/[^A-Za-z0-9]/g, '');
  return (letters.slice(0, 3) || 'TM').toUpperCase();
}

function normalizeKickoff(value) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim().replace('T', ' ');
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  return null;
}

async function getTournamentId(db) {
  const row = await db.prepare('SELECT id FROM tournament ORDER BY id DESC LIMIT 1').first();
  if (row) return row.id;
  const created = await db
    .prepare(
      `INSERT INTO tournament (name, season, venue, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind("Masters 7's Football League", '2026', 'Doha', '2026-01-01', '2026-12-31', 'live')
    .run();
  return created.meta.last_row_id;
}

async function resolveClubTeamId(db, { team_id, registration_id }) {
  if (team_id) {
    const team = await db.prepare('SELECT id FROM teams WHERE id = ?').bind(Number(team_id)).first();
    if (!team) {
      const err = new Error('Team not found');
      err.status = 400;
      throw err;
    }
    return team.id;
  }

  if (registration_id) {
    const reg = await db
      .prepare('SELECT id, team_name FROM team_registrations WHERE id = ?')
      .bind(Number(registration_id))
      .first();
    if (!reg) {
      const err = new Error('Registered team not found');
      err.status = 400;
      throw err;
    }
    const existing = await db.prepare('SELECT id FROM teams WHERE name = ?').bind(reg.team_name).first();
    if (existing) return existing.id;
    const result = await db
      .prepare(
        `INSERT INTO teams (name, short_name, city, primary_color, secondary_color)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(reg.team_name, shortNameFrom(reg.team_name), 'Doha', '#00299c', '#f3d117')
      .run();
    return result.meta.last_row_id;
  }

  const err = new Error('Home and away teams are required');
  err.status = 400;
  throw err;
}

function optionalScore(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

const app = new Hono().basePath('/api');

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

app.get('/settings', async (c) => {
  try {
    const value = await getSetting(c.env.DB, 'registration_open', '1');
    return c.json({ registration_open: value !== '0' });
  } catch {
    return c.json({ registration_open: true });
  }
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
  const denied = await requireAdmin(c);
  if (denied) return denied;
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

app.get('/registrations', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT
       r.id,
       r.team_name,
       r.manager_name,
       r.contact_number,
       r.email,
       r.captain_name,
       r.captain_mobile,
       r.captain_email,
       r.team_logo,
       r.created_at,
       (
         SELECT COUNT(*) FROM registration_players p WHERE p.registration_id = r.id
       ) AS player_count
     FROM team_registrations r
     ORDER BY r.id DESC`
  ).all();
  return c.json(
    results.map((row) => ({
      ...row,
      player_count: Number(row.player_count),
    }))
  );
});

app.get('/registrations/:id', async (c) => {
  const id = c.req.param('id');
  const registration = await c.env.DB.prepare(
    `SELECT id, team_name, manager_name, contact_number, email, captain_name, captain_mobile,
            captain_email, team_logo, created_at
     FROM team_registrations WHERE id = ?`
  )
    .bind(id)
    .first();

  if (!registration) {
    return c.json({ error: 'Registration not found' }, 404);
  }

  const { results: players } = await c.env.DB.prepare(
    `SELECT id, player_name, qid_number, dob, photo, position, sort_order
     FROM registration_players
     WHERE registration_id = ?
     ORDER BY sort_order ASC, id ASC`
  )
    .bind(id)
    .all();

  return c.json({ ...registration, players });
});

app.post('/registrations', async (c) => {
  const open = await getSetting(c.env.DB, 'registration_open', '1');
  if (open === '0') {
    return c.json({ error: 'Registration is closed' }, 403);
  }
  const body = await c.req.json();
  const {
    team_name,
    manager_name,
    contact_number,
    email,
    captain_name,
    captain_mobile,
    captain_email = null,
    team_logo = null,
    accepted_rules = false,
    players = [],
  } = body;

  if (!accepted_rules) {
    return c.json({ error: 'You must agree to the Rules & Regulations to register' }, 400);
  }

  if (
    !team_name ||
    !manager_name ||
    !contact_number ||
    !email ||
    !captain_name ||
    !captain_mobile ||
    !captain_email
  ) {
    return c.json(
      {
        error:
          'team_name, manager details, and captain details (name, mobile, email) are required',
      },
      400
    );
  }

  if (!Array.isArray(players) || players.length === 0) {
    return c.json({ error: 'At least one player is required' }, 400);
  }

  if (players.length > 10) {
    return c.json({ error: 'A team can have a maximum of 10 players' }, 400);
  }

  for (const [index, player] of players.entries()) {
    if (!player.player_name || !player.qid_number || !player.dob) {
      return c.json(
        { error: `Player ${index + 1} requires player_name, qid_number, and dob` },
        400
      );
    }
  }

  const insertTeam = await c.env.DB.prepare(
    `INSERT INTO team_registrations
      (team_name, manager_name, contact_number, email, captain_name, captain_mobile, captain_email, team_logo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      team_name,
      manager_name,
      contact_number,
      email,
      captain_name,
      captain_mobile,
      captain_email,
      team_logo
    )
    .run();

  const registrationId = insertTeam.meta.last_row_id;
  const statements = players.map((player, index) =>
    c.env.DB.prepare(
      `INSERT INTO registration_players
        (registration_id, player_name, qid_number, dob, photo, position, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      registrationId,
      player.player_name,
      player.qid_number,
      player.dob,
      player.photo || null,
      player.position || null,
      index
    )
  );

  await c.env.DB.batch(statements);

  return c.json({ id: registrationId, ok: true, players: players.length }, 201);
});

app.post('/admin/login', async (c) => {
  const secret = c.env.ADMIN_PASSWORD;
  if (!secret) {
    return c.json({ error: 'Admin is not configured' }, 503);
  }
  const { password } = await c.req.json();
  if (!password || password !== secret) {
    return c.json({ error: 'Invalid password' }, 401);
  }
  const token = await createAdminToken(secret);
  return c.json({ ok: true, token });
});

app.patch('/admin/settings', async (c) => {
  const denied = await requireAdmin(c);
  if (denied) return denied;
  const body = await c.req.json();
  if (typeof body.registration_open !== 'boolean') {
    return c.json({ error: 'registration_open (boolean) is required' }, 400);
  }
  await setSetting(c.env.DB, 'registration_open', body.registration_open ? '1' : '0');
  return c.json({ ok: true, registration_open: body.registration_open });
});

app.patch('/admin/registrations/:id', async (c) => {
  const denied = await requireAdmin(c);
  if (denied) return denied;
  const id = c.req.param('id');
  const body = await c.req.json();
  const current = await c.env.DB.prepare('SELECT * FROM team_registrations WHERE id = ?')
    .bind(id)
    .first();
  if (!current) {
    return c.json({ error: 'Team not found' }, 404);
  }

  await c.env.DB.prepare(
    `UPDATE team_registrations
     SET team_name = ?,
         manager_name = ?,
         contact_number = ?,
         email = ?,
         captain_name = ?,
         captain_mobile = ?,
         captain_email = ?
     WHERE id = ?`
  )
    .bind(
      body.team_name ?? current.team_name,
      body.manager_name ?? current.manager_name,
      body.contact_number ?? current.contact_number,
      body.email ?? current.email,
      body.captain_name ?? current.captain_name,
      body.captain_mobile ?? current.captain_mobile,
      body.captain_email ?? current.captain_email,
      id
    )
    .run();

  return c.json({ ok: true });
});

app.delete('/admin/registrations/:id', async (c) => {
  const denied = await requireAdmin(c);
  if (denied) return denied;
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM registration_players WHERE registration_id = ?').bind(id).run();
  const result = await c.env.DB.prepare('DELETE FROM team_registrations WHERE id = ?').bind(id).run();
  if (!result.meta.changes) {
    return c.json({ error: 'Team not found' }, 404);
  }
  return c.json({ ok: true });
});

app.patch('/admin/players/:id', async (c) => {
  const denied = await requireAdmin(c);
  if (denied) return denied;
  const id = c.req.param('id');
  const body = await c.req.json();
  const current = await c.env.DB.prepare('SELECT * FROM registration_players WHERE id = ?')
    .bind(id)
    .first();
  if (!current) {
    return c.json({ error: 'Player not found' }, 404);
  }

  await c.env.DB.prepare(
    `UPDATE registration_players
     SET player_name = ?,
         qid_number = ?,
         dob = ?,
         position = ?
     WHERE id = ?`
  )
    .bind(
      body.player_name ?? current.player_name,
      body.qid_number ?? current.qid_number,
      body.dob ?? current.dob,
      body.position ?? current.position,
      id
    )
    .run();

  return c.json({ ok: true });
});

app.delete('/admin/players/:id', async (c) => {
  const denied = await requireAdmin(c);
  if (denied) return denied;
  const id = c.req.param('id');
  const result = await c.env.DB.prepare('DELETE FROM registration_players WHERE id = ?').bind(id).run();
  if (!result.meta.changes) {
    return c.json({ error: 'Player not found' }, 404);
  }
  return c.json({ ok: true });
});

app.post('/admin/matches', async (c) => {
  const denied = await requireAdmin(c);
  if (denied) return denied;
  const body = await c.req.json();
  const kickoff_at = normalizeKickoff(body.kickoff_at);
  const venue = String(body.venue || '').trim();
  const matchday = Number(body.matchday || 1);

  if (!kickoff_at) {
    return c.json({ error: 'kickoff date and time are required' }, 400);
  }
  if (!venue) {
    return c.json({ error: 'venue is required' }, 400);
  }
  if (!Number.isInteger(matchday) || matchday < 1) {
    return c.json({ error: 'matchday must be a positive number' }, 400);
  }

  let home_team_id;
  let away_team_id;
  try {
    home_team_id = await resolveClubTeamId(c.env.DB, {
      team_id: body.home_team_id,
      registration_id: body.home_registration_id,
    });
    away_team_id = await resolveClubTeamId(c.env.DB, {
      team_id: body.away_team_id,
      registration_id: body.away_registration_id,
    });
  } catch (err) {
    return c.json({ error: err.message }, err.status || 400);
  }

  if (home_team_id === away_team_id) {
    return c.json({ error: 'Home and away teams must be different' }, 400);
  }

  const status = MATCH_STATUSES.includes(body.status) ? body.status : 'scheduled';
  const tournament_id = await getTournamentId(c.env.DB);
  const result = await c.env.DB
    .prepare(
      `INSERT INTO matches
        (tournament_id, home_team_id, away_team_id, matchday, kickoff_at, venue, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(tournament_id, home_team_id, away_team_id, matchday, kickoff_at, venue, status)
    .run();

  return c.json({ ok: true, id: result.meta.last_row_id }, 201);
});

app.patch('/admin/matches/:id', async (c) => {
  const denied = await requireAdmin(c);
  if (denied) return denied;
  const id = c.req.param('id');
  const current = await c.env.DB.prepare('SELECT * FROM matches WHERE id = ?').bind(id).first();
  if (!current) {
    return c.json({ error: 'Match not found' }, 404);
  }

  const body = await c.req.json();
  let home_team_id = current.home_team_id;
  let away_team_id = current.away_team_id;

  if (body.home_team_id || body.home_registration_id) {
    try {
      home_team_id = await resolveClubTeamId(c.env.DB, {
        team_id: body.home_team_id,
        registration_id: body.home_registration_id,
      });
    } catch (err) {
      return c.json({ error: err.message }, err.status || 400);
    }
  }
  if (body.away_team_id || body.away_registration_id) {
    try {
      away_team_id = await resolveClubTeamId(c.env.DB, {
        team_id: body.away_team_id,
        registration_id: body.away_registration_id,
      });
    } catch (err) {
      return c.json({ error: err.message }, err.status || 400);
    }
  }

  if (home_team_id === away_team_id) {
    return c.json({ error: 'Home and away teams must be different' }, 400);
  }

  const kickoff_at = body.kickoff_at ? normalizeKickoff(body.kickoff_at) : current.kickoff_at;
  if (!kickoff_at) {
    return c.json({ error: 'kickoff date and time are invalid' }, 400);
  }

  const venue = body.venue != null ? String(body.venue).trim() : current.venue;
  if (!venue) {
    return c.json({ error: 'venue is required' }, 400);
  }

  const matchday =
    body.matchday != null ? Number(body.matchday) : current.matchday;
  if (!Number.isInteger(matchday) || matchday < 1) {
    return c.json({ error: 'matchday must be a positive number' }, 400);
  }

  const status = MATCH_STATUSES.includes(body.status) ? body.status : current.status;
  const home_score =
    body.home_score !== undefined ? optionalScore(body.home_score) : current.home_score;
  const away_score =
    body.away_score !== undefined ? optionalScore(body.away_score) : current.away_score;

  await c.env.DB
    .prepare(
      `UPDATE matches
       SET home_team_id = ?,
           away_team_id = ?,
           matchday = ?,
           kickoff_at = ?,
           venue = ?,
           status = ?,
           home_score = ?,
           away_score = ?
       WHERE id = ?`
    )
    .bind(
      home_team_id,
      away_team_id,
      matchday,
      kickoff_at,
      venue,
      status,
      home_score,
      away_score,
      id
    )
    .run();

  return c.json({ ok: true });
});

app.delete('/admin/matches/:id', async (c) => {
  const denied = await requireAdmin(c);
  if (denied) return denied;
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM goals WHERE match_id = ?').bind(id).run();
  const result = await c.env.DB.prepare('DELETE FROM matches WHERE id = ?').bind(id).run();
  if (!result.meta.changes) {
    return c.json({ error: 'Match not found' }, 404);
  }
  return c.json({ ok: true });
});

export const onRequest = handle(app);
