type ErrorLike = {
  message?: string;
  hint?: string;
  details?: string;
  code?: string;
};

function asErrorLike(error: unknown): ErrorLike | null {
  if (!error || typeof error !== 'object') return null;
  return error as ErrorLike;
}

/** PostgREST / Supabase client errors (may not be `instanceof Error` in React Native). */
export function formatSupabaseError(error: unknown): string {
  const o = asErrorLike(error);
  if (!o) return '';

  const parts: string[] = [];
  if (typeof o.message === 'string' && o.message.trim()) parts.push(o.message.trim());
  if (typeof o.hint === 'string' && o.hint.trim()) parts.push(o.hint.trim());
  if (typeof o.details === 'string' && o.details.trim()) parts.push(o.details.trim());
  if (typeof o.code === 'string' && o.code.trim() && parts.length === 0) parts.push(o.code.trim());

  return parts.join(' — ');
}

export function errorMessageFromUnknown(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message.trim();

  const fromSupabase = formatSupabaseError(error);
  if (fromSupabase) return fromSupabase;

  if (typeof error === 'string' && error.trim()) return error.trim();

  return fallback;
}
