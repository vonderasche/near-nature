import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';
import { formatExploreObservations } from '@/lib/explore/exploreSpeciesTypes';

/** Primary line — mirrors leaderboard `#rank · @user` pattern. */
export function exploreSpeciesTitle(species: ExploreSpecies): string {
  const name = species.commonName.trim() || 'Unknown species';
  return species.rank > 0 ? `#${species.rank} · ${name}` : name;
}

/** Italic secondary line — Latin name (like motto on leaderboard). */
export function exploreSpeciesSubtitle(species: ExploreSpecies): string {
  return species.latinName.trim();
}

/** Muted tertiary line — stats (like native / non-native counts on leaderboard). */
export function exploreSpeciesMeta(species: ExploreSpecies): string {
  const parts: string[] = [];
  if (species.isFeatured) parts.push('Featured');
  parts.push(formatExploreObservations(species.observationsCount));
  if (species.iconicTaxonName?.trim()) parts.push(species.iconicTaxonName.trim());
  if (species.bonusPoints > 0) parts.push(`+${species.bonusPoints} bonus points`);
  return parts.join(' · ');
}

export function exploreSpeciesAccessibilityLabel(species: ExploreSpecies): string {
  return `${exploreSpeciesTitle(species)}, ${exploreSpeciesSubtitle(species)}, ${exploreSpeciesMeta(species)}`;
}
