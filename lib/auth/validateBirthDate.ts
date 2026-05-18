/** Minimum age to create an account (US COPPA-style). */
export const MIN_SIGNUP_AGE_YEARS = 13;

/** Age at which parental-consent messaging is not shown on sign-up. */
export const ADULT_AGE_YEARS = 18;

const MAX_AGE_YEARS = 120;

export type BirthDateValidationResult = { ok: true; isoDate: string } | { ok: false; message: string };

function parseParts(month: string, day: string, year: string): Date | null {
  const m = Number(month);
  const d = Number(day);
  const y = Number(year);
  if (!Number.isInteger(m) || !Number.isInteger(d) || !Number.isInteger(y)) return null;
  if (y < 1900 || y > new Date().getFullYear()) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

export function ageOnDate(birthDate: Date, onDate = new Date()): number {
  let age = onDate.getFullYear() - birthDate.getFullYear();
  const monthDelta = onDate.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && onDate.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

export function validateBirthDateParts(
  month: string,
  day: string,
  year: string,
): BirthDateValidationResult {
  const m = month.trim();
  const d = day.trim();
  const y = year.trim();

  if (!m || !d || !y) {
    return { ok: false, message: 'Enter your full date of birth.' };
  }
  if (y.length !== 4) {
    return { ok: false, message: 'Enter a four-digit birth year.' };
  }

  const parsed = parseParts(m, d, y);
  if (!parsed) {
    return { ok: false, message: 'Enter a valid date of birth.' };
  }

  const age = ageOnDate(parsed);
  if (age < MIN_SIGNUP_AGE_YEARS) {
    return {
      ok: false,
      message: `You must be at least ${MIN_SIGNUP_AGE_YEARS} years old to create an account.`,
    };
  }
  if (age > MAX_AGE_YEARS) {
    return { ok: false, message: 'Enter a valid date of birth.' };
  }

  const iso = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
  return { ok: true, isoDate: iso };
}

/** Validates an ISO `YYYY-MM-DD` string (e.g. from sign-up metadata). */
export function validateBirthDateIso(iso: string): BirthDateValidationResult {
  const trimmed = iso.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return { ok: false, message: 'Enter a valid date of birth.' };
  }
  const [, year, month, day] = match;
  return validateBirthDateParts(String(Number(month)), String(Number(day)), year);
}

/** True when the user is old enough to sign up but under {@link ADULT_AGE_YEARS}. */
export function isSignupMinor(isoDate: string): boolean {
  const result = validateBirthDateIso(isoDate);
  if (!result.ok) return false;
  const match = result.isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const [, y, m, d] = match;
  const birth = new Date(Number(y), Number(m) - 1, Number(d));
  const age = ageOnDate(birth);
  return age >= MIN_SIGNUP_AGE_YEARS && age < ADULT_AGE_YEARS;
}
