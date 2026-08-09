import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ping } from './db/pool.js';
import tournamentRouter from './routes/tournament.js';
import teamsRouter from './routes/teams.js';
import matchesRouter from './routes/matches.js';
import standingsRouter from './routes/standings.js';
import playersRouter from './routes/players.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5001);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  })
);
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await ping();
    res.json({ ok: true, service: 'manjappada-masters-api', db: 'up' });
  } catch (err) {
    res.status(503).json({ ok: false, service: 'manjappada-masters-api', db: 'down', error: err.message });
  }
});

app.use('/api/tournament', tournamentRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/standings', standingsRouter);
app.use('/api/players', playersRouter);

const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(port, () => {
  console.log(`Manjappada Masters API listening on http://localhost:${port}`);
});
