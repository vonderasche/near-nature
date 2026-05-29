/** First word of a binomial / trinomial Latin name (genus). */
export function extractGenusFromLatinName(latinName: string): string {
  const trimmed = latinName.trim();
  if (!trimmed) return '';
  return trimmed.split(/\s+/)[0] ?? '';
}
