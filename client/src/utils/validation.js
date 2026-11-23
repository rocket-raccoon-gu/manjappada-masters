/** Masters Cup 2026: age 35+ → born on or before 31 Dec 1991 */
export const MAX_DOB = '1991-12-31';
export const MIN_DOB = '1940-01-01';

export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

/**
 * Qatar mobile: 8 digits starting with 3/5/6/7.
 * Accepts local form or with +974 / 974 country code.
 */
export function normalizeQatarMobile(value) {
  let digits = digitsOnly(value);
  if (digits.startsWith('974') && digits.length === 11) {
    digits = digits.slice(3);
  }
  return digits;
}

export function isValidQatarMobile(value) {
  const digits = normalizeQatarMobile(value);
  return /^[3567]\d{7}$/.test(digits);
}

export function qatarMobileError(value) {
  if (!String(value || '').trim()) return 'Mobile number is required.';
  if (!isValidQatarMobile(value)) {
    return 'Enter a valid Qatar mobile (8 digits starting with 3, 5, 6, or 7). Example: 50123456';
  }
  return '';
}

/** Qatar ID (QID): exactly 11 digits. */
export function isValidQid(value) {
  return /^\d{11}$/.test(digitsOnly(value));
}

export function qidError(value) {
  const digits = digitsOnly(value);
  if (!digits) return 'QID number is required.';
  if (!isValidQid(digits)) return 'QID must be exactly 11 digits.';
  return '';
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

export function dobError(value) {
  const dob = parseDob(value);
  if (!dob) return 'Enter a valid date of birth.';
  if (dob > MAX_DOB) {
    return 'Players must be age 35 or above (born on or before 31 December 1991).';
  }
  if (dob < MIN_DOB) return 'Please check the date of birth.';
  return '';
}

