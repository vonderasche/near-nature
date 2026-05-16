import { US_STATES } from '@/constants/us-states';

export type ExploreSpeciesType = 'animals' | 'plants';

export const EXPLORE_SPECIES_TYPES: ExploreSpeciesType[] = ['animals', 'plants'];

export type ExploreSpecies = {
  id: string;
  inaturalistId: number;
  latinName: string;
  commonName: string;
  type: ExploreSpeciesType;
  iconicTaxonName: string | null;
  observationsCount: number;
  rank: number;
  state: string;
  wikipediaUrl: string | null;
  imageUrl: string | null;
  wikiSummary: string | null;
  wikiImageUrl: string | null;
  isFeatured: boolean;
  bonusPoints: number;
};

export function exploreTypeLabel(type: ExploreSpeciesType): string {
  return type === 'animals' ? 'Animals' : 'Plants';
}

/** Maps two-letter code to full state name for `explore_species.state` (e.g. FL → Florida). */
export function stateNameFromCode(stateCode: string): string {
  const code = stateCode.trim().toUpperCase().slice(0, 2);
  const row = US_STATES.find((s) => s.code === code);
  return row?.name ?? stateCode.trim();
}

export function formatExploreObservations(count: number): string {
  if (!Number.isFinite(count) || count < 0) return '0 observations';
  return `${Math.round(count).toLocaleString()} iNaturalist observations`;
}
