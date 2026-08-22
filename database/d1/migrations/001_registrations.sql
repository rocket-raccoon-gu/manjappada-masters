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
