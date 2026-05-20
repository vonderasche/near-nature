/** Strip author/citation and normalize casing — keep in sync with `normalize_latin_name_for_search` SQL. */
export function normalizeLatinNameForSearch(latinName: string): string {
  let stripped = latinName.trim();
  while (/\([^)]*\)/.test(stripped)) {
    stripped = stripped.replace(/\s*\([^)]*\)/g, '');
  }
  const withoutCitation = stripped.split(',')[0] ?? '';
  return withoutCitation.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** First token of normalized Latin name (genus) for genus-only search. */
export function latinGenusForSearch(latinName: string): string {
  const normalized = normalizeLatinNameForSearch(latinName);
  const genus = normalized.split(/\s+/)[0]?.trim();
  return genus ?? '';
}
