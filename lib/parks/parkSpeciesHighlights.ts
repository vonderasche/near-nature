import type { FloridaStatePark, ParkSpeciesHighlight } from '@/types/florida-state-park';

export function zipSpeciesHighlights(names: readonly string[], imageUrls: readonly string[]): ParkSpeciesHighlight[] {
  return names.map((name, index) => ({
    name,
    imageUrl: imageUrls[index]?.trim() ?? '',
  }));
}

export function speciesHighlightNames(highlights: readonly ParkSpeciesHighlight[]): string[] {
  return highlights.map((item) => item.name);
}

export function resolveParkListImageUrl(park: FloridaStatePark): string {
  const hero = park.imageUrl.trim();
  if (hero) return hero;

  for (const item of park.topAnimals) {
    const url = item.imageUrl.trim();
    if (url) return url;
  }
  for (const item of park.topPlants) {
    const url = item.imageUrl.trim();
    if (url) return url;
  }
  return '';
}
