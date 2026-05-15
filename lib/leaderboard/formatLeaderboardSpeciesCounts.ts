import type { DetectionLeaderboardRow } from '@/lib/leaderboard/detectionCountLeaderboardMap';

function speciesLabel(n: number): string {
  return n === 1 ? 'species' : 'species';
}

export function formatNativeSpeciesCount(n: number): string {
  return `${n} native ${speciesLabel(n)}`;
}

export function formatNonNativeSpeciesCount(n: number): string {
  return `${n} non-native ${speciesLabel(n)}`;
}

/** Meta line for leaderboard rows: native and non-native distinct species. */
export function formatLeaderboardSpeciesMeta(row: Pick<
  DetectionLeaderboardRow,
  'nativeSpeciesCount' | 'nonNativeSpeciesCount'
>): string {
  return `${formatNativeSpeciesCount(row.nativeSpeciesCount)} · ${formatNonNativeSpeciesCount(row.nonNativeSpeciesCount)}`;
}

export function formatLeaderboardAccessibilityCounts(row: Pick<
  DetectionLeaderboardRow,
  'nativeSpeciesCount' | 'nonNativeSpeciesCount'
>): string {
  return `${row.nativeSpeciesCount} native species, ${row.nonNativeSpeciesCount} non-native species`;
}
