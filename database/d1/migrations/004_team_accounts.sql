-- Team login credentials + payment receipt for staged registration.
ALTER TABLE team_registrations ADD COLUMN username TEXT;
ALTER TABLE team_registrations ADD COLUMN password_hash TEXT;
ALTER TABLE team_registrations ADD COLUMN payment_receipt TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_team_registrations_username
  ON team_registrations(username);
