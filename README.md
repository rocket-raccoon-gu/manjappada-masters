# Manjappada Masters — Club Cup

Tournament website for Manjappada Masters / Masters 7's Football League.

**Local stack:** React (Vite) · Express · MySQL (XAMPP)  
**Cloud (free):** Cloudflare Pages · Pages Functions (Hono) · D1

## Features

- Tournament home with live season branding
- Fixtures & results with status filters
- Live league table (points, GD, GF)
- Teams & squad pages
- Top scorers leaderboard
- Seeded sample season data
- Admin panel at `/admin` (close registration, manage teams/players, update scores)

---

## Deploy on Cloudflare Free

Cloudflare Free hosts the site + API + database. MySQL is not available on Cloudflare; production uses **D1 (SQLite)**.

### 1. Prerequisites

- Node.js 18+
- A free [Cloudflare](https://dash.cloudflare.com) account

### 2. Install dependencies

```bash
npm install
npm run install:all
```

### 3. Log in to Cloudflare

```bash
npx wrangler login
```

### 4. Create the D1 database

```bash
npx wrangler d1 create manjappada_masters
```

Copy the printed `database_id` into [`wrangler.toml`](wrangler.toml) (replace the placeholder `00000000-0000-0000-0000-000000000001`).

### 5. Apply schema + seed (remote)

```bash
npm run db:d1:remote
```

### 6. Deploy

```bash
npm run cf:deploy
```

Open the printed `*.pages.dev` URL. Check health at `/api/health`.

Admin: `/admin` — password is `ADMIN_PASSWORD` in [`wrangler.toml`](wrangler.toml) (change it before sharing).

### Local Cloudflare parity (optional)

```bash
npm run db:d1:local
npm run cf:dev
```

Serves the built SPA + Functions + local D1 (default http://localhost:8788).

---

## Quick start (XAMPP local DB)

Use this path for classic Express + MySQL development.

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
- API: http://localhost:5001  
- phpMyAdmin: http://localhost/phpmyadmin  

### 6. Production-style local serve

```bash
npm run build
npm start
```

Serves the built React app from Express on port 5001.

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
client/              React + Vite frontend
server/              Express API (local MySQL path)
functions/           Cloudflare Pages Functions (Hono + D1 API)
database/            MySQL schema + seed
database/d1/         D1/SQLite schema + seed
wrangler.toml        Cloudflare Pages + D1 config
scripts/setup-db.sh  XAMPP DB bootstrap
docker-compose.yml   Optional MySQL (not required with XAMPP)
```

## npm scripts (Cloudflare)

| Script | Description |
|--------|-------------|
| `npm run db:d1:local` | Reset + seed local D1 |
| `npm run db:d1:remote` | Reset + seed remote D1 |
| `npm run cf:dev` | Build + `wrangler pages dev` |
| `npm run cf:deploy` | Build + deploy to Pages |
