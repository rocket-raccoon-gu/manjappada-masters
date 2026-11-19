export const MAX_DOB = '1991-12-31';
export const MIN_DOB = '1940-01-01';

export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

export function normalizeQatarMobile(value) {
  let digits = digitsOnly(value);
  if (digits.startsWith('974') && digits.length === 11) {
    digits = digits.slice(3);
  }
  return digits;
}

export function isValidQatarMobile(value) {
  return /^[3567]\d{7}$/.test(normalizeQatarMobile(value));
}

export function isValidQid(value) {
  return /^\d{11}$/.test(digitsOnly(value));
}

export function parseDob(value) {
  const raw = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [y, m, d] = raw.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return raw;
}

export function isEligibleDob(value) {
  const dob = parseDob(value);
  return Boolean(dob && dob <= MAX_DOB && dob >= MIN_DOB);
}

export function qidMatchesDob(qid, dob) {
  const digits = digitsOnly(qid);
  const parsed = parseDob(dob);
  if (!isValidQid(digits) || !parsed) return true;
  const century = digits[0] === '2' ? 1900 : digits[0] === '3' ? 2000 : null;
  if (century == null) return true;
  const year = century + Number(digits.slice(1, 3));
  const month = digits.slice(3, 5);
  const day = digits.slice(5, 7);
  const expected = `${String(year).padStart(4, '0')}-${month}-${day}`;
  return expected === parsed;
}

export function validatePlayerFields({ player_name, qid_number, dob }) {
  if (!player_name || !String(player_name).trim()) {
    return 'Player name is required';
  }
  if (!isValidQid(qid_number)) {
    return 'QID must be exactly 11 digits';
  }
  if (!isEligibleDob(dob)) {
    return 'Players must be age 35 or above (born on or before 31 December 1991)';
  }
  if (!qidMatchesDob(qid_number, dob)) {
    return 'QID birth date does not match the date of birth entered';
  }
  return null;
}

export function validateTeamMobiles({ contact_number, captain_mobile }) {
  if (!isValidQatarMobile(contact_number)) {
    return 'Manager mobile must be a valid Qatar number (8 digits starting with 3, 5, 6, or 7)';
  }
  if (!isValidQatarMobile(captain_mobile)) {
    return 'Captain mobile must be a valid Qatar number (8 digits starting with 3, 5, 6, or 7)';
  }
  return null;
}
