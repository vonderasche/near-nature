import type { ExplorerBoardMemberRow } from '@/lib/explorerBoard/explorerBoardMemberMap';

function speciesLabel(_n: number): string {
  return 'species';
}

export function formatPointsTotal(n: number): string {
  const count = Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
  return count === 1 ? '1 point' : `${count.toLocaleString(undefined, { maximumFractionDigits: 0 })} points`;
}

export function formatNativeSpeciesCount(n: number): string {
  return `${n} native ${speciesLabel(n)}`;
}

export function formatNonNativeSpeciesCount(n: number): string {
  return `${n} non-native ${speciesLabel(n)}`;
}

/** Meta line for Explorer Board rows: points plus native and non-native distinct species. */
export function formatExplorerBoardSpeciesMeta(
  row: Pick<ExplorerBoardMemberRow, 'pointsTotal' | 'nativeSpeciesCount' | 'nonNativeSpeciesCount'>,
): string {
  return `${formatPointsTotal(row.pointsTotal)} · ${formatNativeSpeciesCount(row.nativeSpeciesCount)} · ${formatNonNativeSpeciesCount(row.nonNativeSpeciesCount)}`;
}

export function formatExplorerBoardAccessibilityCounts(
  row: Pick<ExplorerBoardMemberRow, 'pointsTotal' | 'nativeSpeciesCount' | 'nonNativeSpeciesCount'>,
): string {
  return `${formatPointsTotal(row.pointsTotal)}, ${row.nativeSpeciesCount} native species, ${row.nonNativeSpeciesCount} non-native species`;
}
