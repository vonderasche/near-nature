import type { ExploreSpeciesByType } from '@/lib/explore/exploreSpeciesCategory';
import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';

export function partitionExploreSpeciesByType(rows: ExploreSpecies[]): ExploreSpeciesByType {
  const animals: ExploreSpecies[] = [];
  const plants: ExploreSpecies[] = [];
  for (const row of rows) {
    if (row.type === 'plants') plants.push(row);
    else animals.push(row);
  }
  return { animals, plants };
}
