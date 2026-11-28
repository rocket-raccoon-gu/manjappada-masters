PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS tournament;

PRAGMA foreign_keys = ON;

CREATE TABLE tournament (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  season TEXT NOT NULL,
  venue TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  short_name TEXT NOT NULL,
  city TEXT NOT NULL,
  primary_color TEXT NOT NULL DEFAULT '#00299c',
  secondary_color TEXT NOT NULL DEFAULT '#f3d117',
  coach TEXT NULL,
  founded_year INTEGER NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  jersey_number INTEGER NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('GK', 'DF', 'MF', 'FW')),
  age INTEGER NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  UNIQUE (team_id, jersey_number)
);

CREATE TABLE matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL,
  home_team_id INTEGER NOT NULL,
  away_team_id INTEGER NOT NULL,
  matchday INTEGER NOT NULL,
  kickoff_at TEXT NOT NULL,
  venue TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished', 'postponed')),
  home_score INTEGER NULL,
  away_score INTEGER NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE,
  FOREIGN KEY (home_team_id) REFERENCES teams(id),
  FOREIGN KEY (away_team_id) REFERENCES teams(id),
  CHECK (home_team_id <> away_team_id)
);

CREATE TABLE goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  minute INTEGER NOT NULL,
  is_own_goal INTEGER NOT NULL DEFAULT 0,
  is_penalty INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS team_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_name TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  captain_name TEXT NOT NULL,
  captain_mobile TEXT NOT NULL,
  captain_email TEXT,
  team_logo TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS registration_players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registration_id INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  qid_number TEXT NOT NULL,
  dob TEXT NOT NULL,
  photo TEXT,
  position TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (registration_id) REFERENCES team_registrations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_registration_players_reg
  ON registration_players(registration_id);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('registration_open', '0');
