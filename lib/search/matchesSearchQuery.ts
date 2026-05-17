import { normalizeSearchQuery } from '@/lib/search/normalizeSearchQuery';

/** Every query word must appear somewhere in the combined field text. */
export function matchesSearchInFields(
  fields: readonly (string | null | undefined)[],
  query: string,
): boolean {
  const words = normalizeSearchQuery(query);
  if (words.length === 0) return true;

  const haystack = fields
    .map((f) => (f ?? '').trim().toLowerCase())
    .filter((f) => f.length > 0)
    .join('\n');

  if (!haystack) return false;
  return words.every((word) => haystack.includes(word));
}
