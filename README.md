# Manjappada Masters — Club Cup

Local tournament website for the Manjappada Masters football club cup.

**Stack:** React (Vite) · Express · MySQL

## Features

- Tournament home with live season branding
- Fixtures & results with status filters
- Live league table (points, GD, GF)
- Teams & squad pages
- Top scorers leaderboard
- Seeded sample season data

## Quick start (local, no Docker)

Docker is optional. On this machine MySQL can run directly.

### 1. Prerequisites

- Node.js 18+
- MySQL 8 (`sudo apt-get install -y mysql-server`)

### 2. Install dependencies

```bash
npm install
npm run install:all
```

### 3. Set up the database

```bash
npm run db:setup
```

This starts MySQL if needed, creates the `masters` user, and loads schema + seed data.

### 4. Run the app

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:5000  

Or run separately:

```bash
npm run server
npm run client
```

### 5. Production-style local serve

```bash
npm run build
npm start
```

Serves the built React app from Express on port 5000.

## Optional: MySQL via Docker

If you have Docker installed:

```bash
docker compose up -d db
```

Schema + seed load automatically from `database/`.

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
client/          React + Vite frontend
server/          Express API
database/        MySQL schema + seed
scripts/         Local setup helpers
docker-compose.yml   Optional Docker MySQL
```

## Default DB credentials

- Database: `manjappada_masters`
- User: `masters` / `masters123`
- Port: `3306`
- Config: `server/.env` (from `.env.example`)
