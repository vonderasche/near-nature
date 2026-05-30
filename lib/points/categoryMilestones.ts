import {
  BADGE_BONUS_POINTS,
  ENDS_OF_THE_EARTH_BADGE_KEY,
  ENDS_OF_THE_EARTH_MAIN_IDS,
  type CategoryTierId,
  MAIN_CATEGORIES,
  MAIN_TIER_POINTS,
  mainCategoryHasSubTierBadges,
  type MainCategoryId,
  mainMilestoneAwardKey,
  SUB_TIER_BADGE_SUBCATEGORY_IDS,
  SUB_TIER_POINTS,
  SUB_TIER_SPECIES_THRESHOLDS,
  TIER_SPECIES_THRESHOLDS,
  type SubcategoryId,
  subTierForSpeciesCount,
  subMilestoneAwardKey,
  tierForSpeciesCount,
  trueVoyagerBadgeKey,
  getSubcategory,
} from '@/constants/naturalist-categories';
import { mapDbCategoryToSubcategory } from '@/lib/points/mapDbCategoryToSubcategory';

export type DiscoveryRow = { latin_name: string; category: string };

export type SpeciesCounts = {
  bySub: Map<SubcategoryId, number>;
  byMain: Map<MainCategoryId, number>;
};

export type MilestoneAward = {
  awardKey: string;
  points: number;
  label: string;
};

const TIER_ORDER: CategoryTierId[] = ['explorer', 'adventurer', 'voyager'];

export function buildSpeciesCounts(rows: readonly DiscoveryRow[]): SpeciesCounts {
  const bySub = new Map<SubcategoryId, Set<string>>();
  const byMain = new Map<MainCategoryId, Set<string>>();

  for (const row of rows) {
    const sub = mapDbCategoryToSubcategory(row.category);
    if (!sub) continue;
    const main = getSubcategory(sub).mainId;
    const latin = row.latin_name.trim().toLowerCase();
    if (!latin) continue;

    if (!bySub.has(sub)) bySub.set(sub, new Set());
    bySub.get(sub)!.add(latin);

    if (!byMain.has(main)) byMain.set(main, new Set());
    byMain.get(main)!.add(latin);
  }

  return {
    bySub: new Map([...bySub.entries()].map(([k, v]) => [k, v.size])),
    byMain: new Map([...byMain.entries()].map(([k, v]) => [k, v.size])),
  };
}

export function milestonesForNewCounts(
  counts: SpeciesCounts,
  existingAwardKeys: ReadonlySet<string>,
): MilestoneAward[] {
  const awards: MilestoneAward[] = [];

  for (const main of MAIN_CATEGORIES) {
    const mainCount = counts.byMain.get(main.id) ?? 0;
    const mainTier = tierForSpeciesCount(mainCount);
    if (!mainTier) continue;

    for (const tier of TIER_ORDER) {
      if (TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(mainTier)) break;
      const key = mainMilestoneAwardKey(main.id, tier);
      if (existingAwardKeys.has(key)) continue;
      awards.push({
        awardKey: key,
        points: MAIN_TIER_POINTS[tier],
        label: `${main.label} ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
      });
    }
  }

  for (const subId of SUB_TIER_BADGE_SUBCATEGORY_IDS) {
    const subCount = counts.bySub.get(subId) ?? 0;
    const subTier = subTierForSpeciesCount(subCount);
    if (!subTier) continue;
    const sub = getSubcategory(subId);

    for (const tier of TIER_ORDER) {
      if (TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(subTier)) break;
      const key = subMilestoneAwardKey(subId, tier);
      if (existingAwardKeys.has(key)) continue;
      awards.push({
        awardKey: key,
        points: SUB_TIER_POINTS[tier],
        label: `${sub.label} ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
      });
    }
  }

  for (const main of MAIN_CATEGORIES) {
    const badgeKey = trueVoyagerBadgeKey(main.id);
    if (existingAwardKeys.has(badgeKey)) continue;

    const mainCount = counts.byMain.get(main.id) ?? 0;
    if (tierForSpeciesCount(mainCount) !== 'voyager') continue;

    const subBadgeIds = SUB_TIER_BADGE_SUBCATEGORY_IDS.filter(
      (subId) => getSubcategory(subId).mainId === main.id,
    );
    const allSubsVoyager =
      subBadgeIds.length === 0 ||
      subBadgeIds.every(
        (subId) => subTierForSpeciesCount(counts.bySub.get(subId) ?? 0) === 'voyager',
      );
    if (!allSubsVoyager) continue;

    awards.push({
      awardKey: badgeKey,
      points: BADGE_BONUS_POINTS.trueVoyager,
      label: `True Voyager — ${main.label}`,
    });
  }

  if (!existingAwardKeys.has(ENDS_OF_THE_EARTH_BADGE_KEY)) {
    const allMainsVoyager = ENDS_OF_THE_EARTH_MAIN_IDS.every(
      (mainId) => tierForSpeciesCount(counts.byMain.get(mainId) ?? 0) === 'voyager',
    );
    if (allMainsVoyager) {
      awards.push({
        awardKey: ENDS_OF_THE_EARTH_BADGE_KEY,
        points: BADGE_BONUS_POINTS.endsOfTheEarth,
        label: 'Ends of the Earth',
      });
    }
  }

  return awards;
}

export function getMainTier(mainId: MainCategoryId, counts: SpeciesCounts): CategoryTierId | null {
  return tierForSpeciesCount(counts.byMain.get(mainId) ?? 0);
}

export function getSubTier(subId: SubcategoryId, counts: SpeciesCounts): CategoryTierId | null {
  return subTierForSpeciesCount(counts.bySub.get(subId) ?? 0);
}

export function progressPercent(
  count: number,
  max: number = TIER_SPECIES_THRESHOLDS.voyager,
): number {
  return Math.min(100, Math.round((count / max) * 100));
}

export function subProgressPercent(count: number): number {
  return progressPercent(count, SUB_TIER_SPECIES_THRESHOLDS.voyager);
}
