import {
  MAIN_CATEGORIES,
  getSubcategoryLabel,
  type MainCategoryId,
  type SubcategoryId,
} from '@/constants/naturalist-categories';
import type { MainCategoryProgress } from '@/lib/profile/categoryProgressTypes';
import {
  getMainTier,
  getSubTier,
  progressPercent,
  type SpeciesCounts,
} from '@/lib/points/categoryMilestones';

const ALL_SUB_IDS = new Set<SubcategoryId>(
  MAIN_CATEGORIES.flatMap((main) => main.subcategoryIds),
);

const ALL_MAIN_IDS = new Set<MainCategoryId>(MAIN_CATEGORIES.map((m) => m.id));

function parseCountMap(
  entries: readonly { id: string; speciesCount: number }[],
  allowed: ReadonlySet<string>,
): Map<string, number> {
  const out = new Map<string, number>();
  for (const entry of entries) {
    const id = entry.id.trim();
    if (!id || !allowed.has(id)) continue;
    out.set(id, Math.max(0, Number(entry.speciesCount) || 0));
  }
  return out;
}

/** Builds discipline progress trees from server-aggregated species counts. */
export function buildMainCategoryProgress(
  subSpeciesCounts: readonly { id: string; speciesCount: number }[],
  mainSpeciesCounts: readonly { id: string; speciesCount: number }[],
): MainCategoryProgress[] {
  const bySub = parseCountMap(subSpeciesCounts, ALL_SUB_IDS) as Map<SubcategoryId, number>;
  const byMain = parseCountMap(mainSpeciesCounts, ALL_MAIN_IDS) as Map<MainCategoryId, number>;

  const counts: SpeciesCounts = { bySub, byMain };

  return MAIN_CATEGORIES.map((main) => {
    const speciesCount = byMain.get(main.id) ?? 0;
    const tier = getMainTier(main.id, counts);
    return {
      id: main.id,
      label: main.label,
      speciesCount,
      tier,
      progressPct: progressPercent(speciesCount),
      subcategories: main.subcategoryIds.map((subId) => {
        const subCount = bySub.get(subId) ?? 0;
        return {
          id: subId,
          label: getSubcategoryLabel(subId),
          speciesCount: subCount,
          tier: getSubTier(subId, counts),
          progressPct: progressPercent(subCount),
        };
      }),
    };
  });
}
