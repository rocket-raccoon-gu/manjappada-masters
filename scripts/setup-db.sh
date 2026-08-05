#!/usr/bin/env bash
# Set up MySQL locally without Docker.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_NAME="${DB_NAME:-manjappada_masters}"
DB_USER="${DB_USER:-masters}"
DB_PASSWORD="${DB_PASSWORD:-masters123}"

echo "→ Ensuring MySQL is running..."

if ! mysqladmin --protocol=socket ping &>/dev/null && ! sudo mysqladmin ping &>/dev/null; then
  if command -v mysqld >/dev/null 2>&1; then
    sudo mkdir -p /var/run/mysqld
    sudo chown mysql:mysql /var/run/mysqld 2>/dev/null || true
    sudo mysqld --user=mysql --daemonize 2>/dev/null || sudo service mysql start 2>/dev/null || true
    sleep 2
  else
    echo "MySQL is not installed."
    echo "Install it with:"
    echo "  sudo apt-get update && sudo apt-get install -y mysql-server"
    exit 1
  fi
fi

if ! sudo mysqladmin ping &>/dev/null; then
  echo "Could not start MySQL. Install mysql-server or start it manually."
  exit 1
fi

echo "→ Creating database user and loading schema/seed..."

sudo mysql <<SQL
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'127.0.0.1';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'%';
FLUSH PRIVILEGES;
SQL

sudo mysql < "$ROOT/database/schema.sql"
sudo mysql < "$ROOT/database/seed.sql"

if [[ ! -f "$ROOT/server/.env" ]]; then
  cp "$ROOT/.env.example" "$ROOT/server/.env"
  echo "→ Created server/.env from .env.example"
fi

echo "✓ Database ready: ${DB_NAME} (user ${DB_USER})"
echo "  Next: npm run dev"
