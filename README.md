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

## Quick start (local)

### 1. Prerequisites

- Node.js 18+
- Docker (recommended for MySQL) **or** a local MySQL 8 instance

### 2. Install dependencies

```bash
npm install
npm run install:all
```

### 3. Start MySQL

With Docker:

```bash
docker compose up -d db
```

Schema + seed load automatically from `database/`.

Without Docker, create a database and run:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Then copy `.env.example` to `server/.env` and set your credentials.

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
docker-compose.yml
```

## Default DB credentials (Docker)

- Database: `manjappada_masters`
- User: `masters` / `masters123`
- Root: `root` / `rootpass`
- Port: `3306`
