export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 24;

const USERNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;

/** Lowercase key for reserved-name and blocklist checks (ignores case and underscores). */
export function usernameComparisonKey(username: string): string {
  return username.trim().toLowerCase().replace(/_/g, '');
}

const RESERVED_KEYS = new Set([
  'admin',
  'administrator',
  'mod',
  'moderator',
  'support',
  'help',
  'system',
  'root',
  'nearnature',
  'nature',
  'official',
  'staff',
  'null',
  'undefined',
]);

/** Substring blocklist (checked on comparison key). Keep family-friendly for a public app. */
const BLOCKED_SUBSTRINGS = [
  'fuck',
  'fuk',
  'shit',
  'bitch',
  'bastard',
  'asshole',
  'dick',
  'cock',
  'pussy',
  'cunt',
  'whore',
  'slut',
  'nigger',
  'nigga',
  'faggot',
  'retard',
  'rape',
  'nazi',
  'hitler',
  'porn',
  'xxx',
  'anal',
  'penis',
  'vagina',
  'boob',
  'tits',
  'cum',
  'jizz',
  'milf',
  'hentai',
  'onlyfans',
];

export type UsernameValidationResult =
  | { ok: true }
  | { ok: false; message: string };

function containsBlockedTerm(raw: string): boolean {
  const lower = raw.trim().toLowerCase();
  const collapsed = lower.replace(/_/g, '');
  const segments = [lower, collapsed, ...lower.split('_').filter(Boolean)];
  return BLOCKED_SUBSTRINGS.some((term) =>
    segments.some((segment) => segment === term || (term.length >= 4 && segment.includes(term))),
  );
}

export function validateUsername(username: string): UsernameValidationResult {
  const raw = username.trim();

  if (raw.length === 0) {
    return { ok: false, message: 'Username is required.' };
  }
  if (raw.length < USERNAME_MIN_LENGTH) {
    return { ok: false, message: `Username must be at least ${USERNAME_MIN_LENGTH} characters.` };
  }
  if (raw.length > USERNAME_MAX_LENGTH) {
    return { ok: false, message: `Username must be ${USERNAME_MAX_LENGTH} characters or fewer.` };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(raw)) {
    return {
      ok: false,
      message: 'Use only letters, numbers, and underscores — no spaces or special characters.',
    };
  }
  if (!USERNAME_PATTERN.test(raw)) {
    return {
      ok: false,
      message: 'Start with a letter or number. End with a letter or number (not an underscore).',
    };
  }
  if (raw.includes('__')) {
    return { ok: false, message: 'Do not use consecutive underscores.' };
  }

  const key = usernameComparisonKey(raw);
  if (RESERVED_KEYS.has(key)) {
    return { ok: false, message: 'That username is reserved. Choose another.' };
  }
  if (containsBlockedTerm(raw)) {
    return { ok: false, message: 'That username is not allowed. Choose a different one.' };
  }

  return { ok: true };
}

/** Strips characters that are never allowed while typing. */
export function sanitizeUsernameInput(text: string): string {
  return text.replace(/[^a-zA-Z0-9_]/g, '').slice(0, USERNAME_MAX_LENGTH);
}

export function isUsernameReadyForAvailabilityCheck(username: string): boolean {
  return validateUsername(username).ok;
}
