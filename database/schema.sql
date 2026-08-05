SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS manjappada_masters
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE manjappada_masters;

DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS tournament;

CREATE TABLE tournament (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  season VARCHAR(40) NOT NULL,
  venue VARCHAR(120) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('upcoming', 'live', 'completed') NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  short_name VARCHAR(10) NOT NULL,
  city VARCHAR(80) NOT NULL,
  primary_color VARCHAR(20) NOT NULL DEFAULT '#0B3D2E',
  secondary_color VARCHAR(20) NOT NULL DEFAULT '#F5C518',
  coach VARCHAR(100) NULL,
  founded_year INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  jersey_number INT NOT NULL,
  position ENUM('GK', 'DF', 'MF', 'FW') NOT NULL,
  age INT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_team_jersey (team_id, jersey_number)
);

CREATE TABLE matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id INT NOT NULL,
  home_team_id INT NOT NULL,
  away_team_id INT NOT NULL,
  matchday INT NOT NULL,
  kickoff_at DATETIME NOT NULL,
  venue VARCHAR(120) NOT NULL,
  status ENUM('scheduled', 'live', 'finished', 'postponed') NOT NULL DEFAULT 'scheduled',
  home_score INT NULL,
  away_score INT NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE,
  FOREIGN KEY (home_team_id) REFERENCES teams(id),
  FOREIGN KEY (away_team_id) REFERENCES teams(id),
  CHECK (home_team_id <> away_team_id)
);

CREATE TABLE goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL,
  player_id INT NOT NULL,
  team_id INT NOT NULL,
  minute INT NOT NULL,
  is_own_goal TINYINT(1) NOT NULL DEFAULT 0,
  is_penalty TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

SET FOREIGN_KEY_CHECKS = 1;
