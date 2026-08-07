# Manjappada Masters — Club Cup

Local tournament website for the Manjappada Masters football club cup.

**Stack:** React (Vite) · Express · MySQL (via **XAMPP**)

## Features

- Tournament home with live season branding
- Fixtures & results with status filters
- Live league table (points, GD, GF)
- Teams & squad pages
- Top scorers leaderboard
- Seeded sample season data

## Quick start (XAMPP local DB)

### 1. Prerequisites

- Node.js 18+
- [XAMPP](https://www.apachefriends.org/) (Apache + MariaDB/MySQL + phpMyAdmin)

### 2. Start XAMPP MySQL

**Linux**

```bash
sudo /opt/lampp/lampp start
# or only MySQL:
sudo /opt/lampp/lampp startmysql
```

**Windows / macOS** — open XAMPP Control Panel and start **MySQL** (and Apache if you want phpMyAdmin).

### 3. Install app dependencies

```bash
npm install
npm run install:all
```

### 4. Create DB + seed data

```bash
npm run db:setup
```

This uses XAMPP’s MySQL (`root` with empty password by default), loads `database/schema.sql` + `database/seed.sql`, and writes `server/.env` if missing.

You can also create the DB in **phpMyAdmin** (`http://localhost/phpmyadmin`) and import those SQL files manually.

### 5. Run the app

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:5000  
- phpMyAdmin: http://localhost/phpmyadmin  

### 6. Production-style local serve

```bash
npm run build
npm start
```

Serves the built React app from Express on port 5000.

## XAMPP DB connection (default)

| Setting  | Value                 |
|----------|-----------------------|
| Host     | `127.0.0.1`           |
| Port     | `3306`                |
| User     | `root`                |
| Password | _(empty)_             |
| Database | `manjappada_masters`  |

Config file: `server/.env` (from `.env.example`).

If you set a MySQL root password in XAMPP, put it in `server/.env` as `DB_PASSWORD=...`.

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health + DB ping |
| GET | `/api/tournament` | Current tournament |
| GET | `/api/teams` | All teams |
| GET | `/api/teams/:id` | Team + players |
| POST | `/api/teams` | Create team |
| GET | `/api/matches` | Fixtures (`?status=&matchday=`) |
| GET | `/api/matches/:id` | Match + goals |
| PATCH | `/api/matches/:id/score` | Update score |
| GET | `/api/standings` | League table |
| GET | `/api/players/scorers` | Top scorers |

## Project layout

```
client/            React + Vite frontend
server/            Express API
database/          MySQL schema + seed
scripts/setup-db.sh  XAMPP DB bootstrap
docker-compose.yml   Optional (not required with XAMPP)
```
