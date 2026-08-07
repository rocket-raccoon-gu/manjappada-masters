#!/usr/bin/env bash
# Set up the tournament DB on local XAMPP MySQL/MariaDB.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_NAME="${DB_NAME:-manjappada_masters}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
LAMPP_BIN="${LAMPP_BIN:-/opt/lampp}"

mysql_cli() {
  if [[ -x "$LAMPP_BIN/bin/mysql" ]]; then
    if [[ -n "$DB_PASSWORD" ]]; then
      "$LAMPP_BIN/bin/mysql" -u "$DB_USER" -p"$DB_PASSWORD" "$@"
    else
      "$LAMPP_BIN/bin/mysql" -u "$DB_USER" "$@"
    fi
  elif command -v mysql >/dev/null 2>&1; then
    if [[ -n "$DB_PASSWORD" ]]; then
      mysql -u "$DB_USER" -p"$DB_PASSWORD" "$@"
    else
      mysql -u "$DB_USER" "$@"
    fi
  else
    echo "MySQL client not found. Install XAMPP or MySQL."
    exit 1
  fi
}

echo "→ Ensuring XAMPP MySQL is running..."

if [[ -x "$LAMPP_BIN/lampp" ]]; then
  if ! "$LAMPP_BIN/bin/mysqladmin" ping &>/dev/null; then
    echo "  Starting XAMPP MySQL..."
    sudo "$LAMPP_BIN/lampp" startmysql
    sleep 2
  fi
  if ! "$LAMPP_BIN/bin/mysqladmin" ping &>/dev/null; then
    echo "Could not start XAMPP MySQL. Try: sudo $LAMPP_BIN/lampp start"
    exit 1
  fi
  echo "  XAMPP MySQL is up ($("$LAMPP_BIN/bin/mysql" -u root -Nse 'SELECT VERSION()' 2>/dev/null || echo MariaDB))"
else
  echo "  XAMPP not found at $LAMPP_BIN"
  echo "  Install from https://www.apachefriends.org/ then re-run this script."
  if ! mysqladmin ping &>/dev/null && ! sudo mysqladmin ping &>/dev/null; then
    echo "No local MySQL is running either."
    exit 1
  fi
fi

echo "→ Loading schema and seed into ${DB_NAME}..."
mysql_cli < "$ROOT/database/schema.sql"
mysql_cli < "$ROOT/database/seed.sql"

if [[ ! -f "$ROOT/server/.env" ]]; then
  cp "$ROOT/.env.example" "$ROOT/server/.env"
  echo "→ Created server/.env from .env.example (XAMPP root / empty password)"
fi

TEAM_COUNT="$(mysql_cli -Nse "SELECT COUNT(*) FROM ${DB_NAME}.teams")"
echo "✓ Database ready on XAMPP: ${DB_NAME} (${TEAM_COUNT} teams)"
echo "  phpMyAdmin: http://localhost/phpmyadmin"
echo "  Next: npm run dev"
