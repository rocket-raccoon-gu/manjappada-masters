-- Clear competition sample/demo rows. Keeps tournament, settings, and registrations.
PRAGMA foreign_keys = OFF;

DELETE FROM goals;
DELETE FROM matches;
DELETE FROM players;
DELETE FROM teams;

PRAGMA foreign_keys = ON;

-- Reset season shell (idempotent).
DELETE FROM tournament;
INSERT INTO tournament (name, season, venue, start_date, end_date, status) VALUES
('Masters 7''s Football League', '2026', 'Doha', '2026-01-01', '2026-12-31', 'upcoming');
