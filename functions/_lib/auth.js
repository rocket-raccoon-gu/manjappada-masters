const encoder = new TextEncoder();

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex) {
  const clean = String(hex || '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return toHex(signature);
}

export function normalizeUsername(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );
  return `${toHex(salt)}:${toHex(bits)}`;
}

export async function verifyPassword(password, stored) {
  if (!password || !stored || !stored.includes(':')) return false;
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const salt = fromHex(saltHex);
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );
  return toHex(bits) === hashHex;
}

export async function createAdminToken(secret) {
  const exp = Date.now() + 12 * 60 * 60 * 1000;
  const payload = `admin.${exp}`;
  const signature = await hmac(secret, payload);
  return `${payload}.${signature}`;
}

export async function verifyAdminToken(secret, token) {
  if (!secret || !token) return false;
  const parts = String(token).split('.');
  if (parts.length !== 3 || parts[0] !== 'admin') return false;
  const exp = Number(parts[1]);
  const signature = parts[2];
  if (!exp || Date.now() > exp) return false;
  const expected = await hmac(secret, `admin.${exp}`);
  return expected === signature;
}

export async function createTeamToken(secret, teamId) {
  const exp = Date.now() + 12 * 60 * 60 * 1000;
  const payload = `team.${teamId}.${exp}`;
  const signature = await hmac(secret, payload);
  return `${payload}.${signature}`;
}

export async function verifyTeamToken(secret, token) {
  if (!secret || !token) return null;
  const parts = String(token).split('.');
  if (parts.length !== 4 || parts[0] !== 'team') return null;
  const teamId = Number(parts[1]);
  const exp = Number(parts[2]);
  const signature = parts[3];
  if (!teamId || !exp || Date.now() > exp) return null;
  const expected = await hmac(secret, `team.${teamId}.${exp}`);
  if (expected !== signature) return null;
  return teamId;
}

export function readBearer(c) {
  const header = c.req.header('Authorization') || '';
  return header.replace(/^Bearer\s+/i, '').trim();
}

export async function requireAdmin(c) {
  const secret = c.env.ADMIN_PASSWORD;
  if (!secret) {
    return c.json({ error: 'Admin is not configured' }, 503);
  }
  const ok = await verifyAdminToken(secret, readBearer(c));
  if (!ok) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  return null;
}

export async function requireTeam(c) {
  const secret = c.env.ADMIN_PASSWORD;
  if (!secret) {
    return { errorResponse: c.json({ error: 'Team auth is not configured' }, 503) };
  }
  const teamId = await verifyTeamToken(secret, readBearer(c));
  if (!teamId) {
    return { errorResponse: c.json({ error: 'Unauthorized' }, 401) };
  }
  return { teamId };
}

export async function getSetting(db, key, fallback = null) {
  const row = await db.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first();
  return row?.value ?? fallback;
}

export async function setSetting(db, key, value) {
  await db
    .prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    )
    .bind(key, value)
    .run();
}
