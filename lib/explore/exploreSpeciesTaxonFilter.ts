import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';

export const EXPLORE_SPECIES_TAXON_FILTERS = ['all', 'birds', 'mammals', 'reptiles'] as const;

export type ExploreSpeciesTaxonFilter = (typeof EXPLORE_SPECIES_TAXON_FILTERS)[number];

export function exploreSpeciesTaxonFilterLabel(filter: ExploreSpeciesTaxonFilter): string {
  switch (filter) {
    case 'birds':
      return 'Birds';
    case 'mammals':
      return 'Mammals';
    case 'reptiles':
      return 'Reptiles';
    default:
      return 'All';
  }
}

function matchesTaxon(iconicTaxonName: string | null, filter: ExploreSpeciesTaxonFilter): boolean {
  if (filter === 'all') return true;
  const taxon = (iconicTaxonName ?? '').toLowerCase();
  switch (filter) {
    case 'birds':
      return taxon.includes('aves') || taxon.includes('bird');
    case 'mammals':
      return taxon.includes('mammalia') || taxon.includes('mammal');
    case 'reptiles':
      return taxon.includes('reptilia') || taxon.includes('reptile');
    default:
      return true;
  }
}

export function filterExploreSpeciesByTaxon(
  items: readonly ExploreSpecies[],
  filter: ExploreSpeciesTaxonFilter,
): ExploreSpecies[] {
  if (filter === 'all') return [...items];
  return items.filter((s) => matchesTaxon(s.iconicTaxonName, filter));
}
