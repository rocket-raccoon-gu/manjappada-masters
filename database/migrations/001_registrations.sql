CREATE TABLE IF NOT EXISTS team_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_name VARCHAR(120) NOT NULL,
  manager_name VARCHAR(120) NOT NULL,
  contact_number VARCHAR(40) NOT NULL,
  email VARCHAR(160) NOT NULL,
  captain_name VARCHAR(120) NOT NULL,
  captain_mobile VARCHAR(40) NOT NULL,
  team_logo LONGTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registration_players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT NOT NULL,
  player_name VARCHAR(120) NOT NULL,
  qid_number VARCHAR(60) NOT NULL,
  dob DATE NOT NULL,
  photo LONGTEXT NULL,
  position VARCHAR(40) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (registration_id) REFERENCES team_registrations(id) ON DELETE CASCADE
);
