/** Trimmed motto for Explorer Board rows, or null when empty / missing. */
export function parseExplorerBoardMotto(value: string | null | undefined): string | null {
  if (value == null) return null;
  const t = value.trim();
  return t.length > 0 ? t : null;
}
