import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../..');

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpass',
    multipleStatements: true,
  });

  try {
    const schema = fs.readFileSync(path.join(root, 'database/schema.sql'), 'utf8');
    const seed = fs.readFileSync(path.join(root, 'database/seed.sql'), 'utf8');
    await connection.query(schema);
    await connection.query(seed);
    console.log('Database schema and seed data applied successfully.');
  } finally {
    await connection.end();
  }
}

run().catch((err) => {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
});
