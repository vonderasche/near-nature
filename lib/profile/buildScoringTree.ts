import {
  BADGE_BONUS_POINTS,
  ENDS_OF_THE_EARTH_BADGE_KEY,
  MAIN_CATEGORIES,
  MAIN_TIER_POINTS,
  SUB_TIER_POINTS,
  TIER_SPECIES_THRESHOLDS,
  type CategoryTierId,
  tierDisplayName,
  trueVoyagerBadgeKey,
  getSubcategoryLabel,
} from '@/constants/naturalist-categories';
import type { MainCategoryProgress } from '@/lib/profile/categoryProgressTypes';

export type ScoringTreeNode = {
  id: string;
  label: string;
  detail?: string;
  points?: number;
  earned: boolean;
  children?: ScoringTreeNode[];
};

const TIER_ORDER: CategoryTierId[] = ['explorer', 'adventurer', 'voyager'];

function tierRows(
  prefix: string,
  scope: 'main' | 'sub',
  speciesCount: number,
  awardKeys: ReadonlySet<string>,
): ScoringTreeNode[] {
  return TIER_ORDER.map((tier) => {
    const threshold = TIER_SPECIES_THRESHOLDS[tier];
    const points = scope === 'main' ? MAIN_TIER_POINTS[tier] : SUB_TIER_POINTS[tier];
    const key = `${prefix}:${tier}`;
    return {
      id: key,
      label: tierDisplayName(tier),
      detail: `${threshold} unique species · ${points} pts`,
      points,
      earned: awardKeys.has(key) || speciesCount >= threshold,
    };
  });
}

export function buildScoringTree(
  mains: readonly MainCategoryProgress[],
  awardKeys: ReadonlySet<string>,
): ScoringTreeNode[] {
  const badgeNodes: ScoringTreeNode[] = [
    {
      id: ENDS_OF_THE_EARTH_BADGE_KEY,
      label: 'Ends of the Earth',
      detail: `Voyager in all 8 main disciplines · ${BADGE_BONUS_POINTS.endsOfTheEarth} pts`,
      points: BADGE_BONUS_POINTS.endsOfTheEarth,
      earned: awardKeys.has(ENDS_OF_THE_EARTH_BADGE_KEY),
    },
    ...MAIN_CATEGORIES.map((main) => {
      const key = trueVoyagerBadgeKey(main.id);
      return {
        id: key,
        label: `True Voyager — ${main.label}`,
        detail: `Main + all sub Voyagers · ${BADGE_BONUS_POINTS.trueVoyager} pts`,
        points: BADGE_BONUS_POINTS.trueVoyager,
        earned: awardKeys.has(key),
      };
    }),
  ];

  const disciplineNodes: ScoringTreeNode[] = mains.map((main) => ({
    id: `main:${main.id}`,
    label: main.label,
    detail: `${main.speciesCount} species logged`,
    children: [
      {
        id: `main-tiers:${main.id}`,
        label: 'Main category tiers',
        children: tierRows(`main:${main.id}`, 'main', main.speciesCount, awardKeys),
      },
      ...main.subcategories.map((sub) => ({
        id: `sub:${sub.id}`,
        label: getSubcategoryLabel(sub.id),
        detail: `${sub.speciesCount} species`,
        children: tierRows(`sub:${sub.id}`, 'sub', sub.speciesCount, awardKeys),
      })),
    ],
  }));

  return [
    {
      id: 'badges',
      label: 'Badges',
      detail: 'One-time bonus awards',
      children: badgeNodes,
    },
    {
      id: 'disciplines',
      label: 'Disciplines & subcategories',
      detail: 'Explorer 10 · Adventurer 25 · Voyager 50 species',
      children: disciplineNodes,
    },
  ];
}
