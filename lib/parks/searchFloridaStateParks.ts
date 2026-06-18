import { normalizeSearchQuery } from '@/lib/search/normalizeSearchQuery';
import type { FloridaStatePark } from '@/types/florida-state-park';

function parkSearchHaystack(park: FloridaStatePark): string {
  return [
    park.parkName,
    park.county,
    park.city,
    park.address,
    park.description,
    park.publicAccess,
    park.topPlants.join(' '),
    park.topAnimals.join(' '),
  ]
    .join(' ')
    .toLowerCase();
}

export function searchFloridaStateParks(
  parks: readonly FloridaStatePark[],
  rawQuery: string,
): FloridaStatePark[] {
  const tokens = normalizeSearchQuery(rawQuery);
  if (tokens.length === 0) return [...parks];

  return parks.filter((park) => {
    const haystack = parkSearchHaystack(park);
    return tokens.every((token) => haystack.includes(token));
  });
}
