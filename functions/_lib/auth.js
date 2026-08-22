const encoder = new TextEncoder();

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
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
