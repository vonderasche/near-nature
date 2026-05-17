/** Lowercase tokens from trimmed query (AND matching across fields). */
export function normalizeSearchQuery(raw: string): string[] {
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((part) => part.length > 0);
}

export function isSearchQueryActive(query: string): boolean {
  return normalizeSearchQuery(query).length > 0;
}
