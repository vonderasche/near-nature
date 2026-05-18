/** Case-insensitive key for matching species across vision and database rows. */
export function normalizeLatinName(latinName: string): string {
  return latinName.trim().toLowerCase().replace(/\s+/g, ' ');
}
