USE manjappada_masters;
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM goals;
DELETE FROM matches;
DELETE FROM players;
DELETE FROM teams;
SET FOREIGN_KEY_CHECKS = 1;
DELETE FROM tournament;
INSERT INTO tournament (name, season, venue, start_date, end_date, status) VALUES
('Masters 7''s Football League', '2026', 'Doha', '2026-01-01', '2026-12-31', 'upcoming');
