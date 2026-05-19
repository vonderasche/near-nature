import { buildMainCategoryProgress } from '@/lib/profile/buildCategoryProgress';
import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';
import type { UserScoringSnapshot } from '@/services/scoringSnapshotService';

function countUniqueSpeciesByField(
  rows: readonly DetectionGalleryRow[],
  field: 'main_category' | 'subcategory',
): { id: string; speciesCount: number }[] {
  const byId = new Map<string, Set<string>>();
  for (const row of rows) {
    const id = row[field]?.trim();
    const latin = row.latin_name?.trim();
    if (!id || !latin) continue;
    let set = byId.get(id);
    if (!set) {
      set = new Set();
      byId.set(id, set);
    }
    set.add(latin.toLowerCase());
  }
  return [...byId.entries()].map(([id, names]) => ({
    id,
    speciesCount: names.size,
  }));
}

/** Derives discipline progress from on-device gallery rows (no server awards). */
export function buildLocalScoringSnapshot(rows: readonly DetectionGalleryRow[]): UserScoringSnapshot {
  const subSpeciesCounts = countUniqueSpeciesByField(rows, 'subcategory');
  const mainSpeciesCounts = countUniqueSpeciesByField(rows, 'main_category');
  const mains = buildMainCategoryProgress(subSpeciesCounts, mainSpeciesCounts);
  const totalSpecies = new Set(
    rows.map((r) => r.latin_name?.trim().toLowerCase()).filter(Boolean) as string[],
  ).size;

  return {
    mains,
    awards: [],
    awardKeys: new Set(),
    breakdown: {
      rows: [],
      totalDetectionPoints: 0,
      totalAwardPoints: 0,
      totalPoints: 0,
      totalSpecies,
    },
  };
}
