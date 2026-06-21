import { inferDiscoverSpeciesSubcategory } from '@/lib/discover/inferDiscoverSpeciesSubcategory';
import { normalizeSearchQuery } from '@/lib/search/normalizeSearchQuery';
import type { DiscoverSpeciesEntry, DiscoverSpeciesKind } from '@/types/discover-species';
import type { FloridaStatePark, ParkSpeciesHighlight } from '@/types/florida-state-park';

function mergeHighlights(
  map: Map<string, { imageUrl: string; parkNames: string[] }>,
  highlights: readonly ParkSpeciesHighlight[],
  parkName: string,
) {
  for (const item of highlights) {
    const name = item.name.trim();
    if (!name) continue;

    const existing = map.get(name);
    if (!existing) {
      map.set(name, {
        imageUrl: item.imageUrl.trim(),
        parkNames: [parkName],
      });
      continue;
    }

    if (!existing.imageUrl && item.imageUrl.trim()) {
      existing.imageUrl = item.imageUrl.trim();
    }
    if (!existing.parkNames.includes(parkName)) {
      existing.parkNames.push(parkName);
    }
  }
}

export function aggregateDiscoverSpecies(
  parks: readonly FloridaStatePark[],
  kind: DiscoverSpeciesKind,
): DiscoverSpeciesEntry[] {
  const map = new Map<string, { imageUrl: string; parkNames: string[] }>();

  for (const park of parks) {
    const highlights = kind === 'plant' ? park.topPlants : park.topAnimals;
    mergeHighlights(map, highlights, park.parkName);
  }

  return [...map.entries()]
    .map(([name, value]) => ({
      name,
      imageUrl: value.imageUrl,
      kind,
      subcategoryId: inferDiscoverSpeciesSubcategory(name, kind),
      parkCount: value.parkNames.length,
      parkNames: [...value.parkNames].sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function searchDiscoverSpecies(
  entries: readonly DiscoverSpeciesEntry[],
  rawQuery: string,
): DiscoverSpeciesEntry[] {
  const tokens = normalizeSearchQuery(rawQuery);
  if (tokens.length === 0) return [...entries];

  return entries.filter((entry) => {
    const haystack = [entry.name, ...entry.parkNames].join(' ').toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
}
