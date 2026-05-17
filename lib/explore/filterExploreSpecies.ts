import { matchesSearchInFields } from '@/lib/search/matchesSearchQuery';
import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';

/** Matches common name, scientific (Latin) name, wiki summary, and taxon label. */
export function filterExploreSpecies(
  items: readonly ExploreSpecies[],
  query: string,
): ExploreSpecies[] {
  const trimmed = query.trim();
  if (!trimmed) return [...items];

  return items.filter((species) =>
    matchesSearchInFields(
      [species.commonName, species.latinName, species.wikiSummary, species.iconicTaxonName],
      trimmed,
    ),
  );
}
