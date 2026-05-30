/**
 * Naturalist discipline taxonomy, tier thresholds, and badge bonuses.
 * Species counts use distinct `latin_name` per user from `public.discoveries`.
 */

export type CategoryTierId = 'explorer' | 'adventurer' | 'voyager';

export type MainCategoryId =
  | 'botanist'
  | 'herpetologist'
  | 'ornithologist'
  | 'mammalogist';

export type SubcategoryId =
  | 'wildflowers'
  | 'trees_shrubs'
  | 'ferns_mosses'
  | 'aquatic_plants'
  | 'cacti_succulents'
  | 'lizards'
  | 'snakes'
  | 'frogs_toads'
  | 'turtles_tortoises'
  | 'salamanders'
  | 'songbirds'
  | 'raptors'
  | 'wading_birds'
  | 'waterfowl'
  | 'shorebirds'
  | 'small_mammals'
  | 'deer_hoofed'
  | 'bats'
  | 'marine_mammals'
  | 'carnivores';

export type SubcategoryDef = {
  id: SubcategoryId;
  label: string;
  mainId: MainCategoryId;
};

export type MainCategoryDef = {
  id: MainCategoryId;
  label: string;
  subcategoryIds: readonly SubcategoryId[];
};

export const TIER_SPECIES_THRESHOLDS: Record<CategoryTierId, number> = {
  explorer: 10,
  adventurer: 25,
  voyager: 50,
};

export const SUB_TIER_SPECIES_THRESHOLDS: Record<CategoryTierId, number> = {
  explorer: 3,
  adventurer: 25,
  voyager: 50,
};

export const MAIN_TIER_POINTS: Record<CategoryTierId, number> = {
  explorer: 50,
  adventurer: 150,
  voyager: 500,
};

export const SUB_TIER_POINTS: Record<CategoryTierId, number> = {
  explorer: 25,
  adventurer: 75,
  voyager: 250,
};

export const BADGE_BONUS_POINTS = {
  endsOfTheEarth: 1000,
  trueVoyager: 2000,
} as const;

/** All main categories required for the Ends of the Earth badge. */
export const ENDS_OF_THE_EARTH_MAIN_IDS: readonly MainCategoryId[] = [
  'botanist',
  'herpetologist',
  'ornithologist',
  'mammalogist',
];

export const BOTANIST_SUBCATEGORY_IDS: readonly SubcategoryId[] = [
  'wildflowers',
  'trees_shrubs',
  'ferns_mosses',
];

export const HERPETOLOGIST_SUBCATEGORY_IDS: readonly SubcategoryId[] = [
  'lizards',
  'snakes',
  'frogs_toads',
  'turtles_tortoises',
  'salamanders',
];

export const ORNITHOLOGIST_SUBCATEGORY_IDS: readonly SubcategoryId[] = [
  'songbirds',
  'raptors',
  'wading_birds',
  'waterfowl',
  'shorebirds',
];

/** Subcategories that earn sub-tier milestone badges (profile “Subcategory tiers” section). */
export const SUB_TIER_BADGE_SUBCATEGORY_IDS: readonly SubcategoryId[] = [
  ...BOTANIST_SUBCATEGORY_IDS,
  ...HERPETOLOGIST_SUBCATEGORY_IDS,
  ...ORNITHOLOGIST_SUBCATEGORY_IDS,
];

export const MAIN_CATEGORIES: readonly MainCategoryDef[] = [
  {
    id: 'botanist',
    label: 'Botanist',
    subcategoryIds: BOTANIST_SUBCATEGORY_IDS,
  },
  {
    id: 'herpetologist',
    label: 'Herpetologist',
    subcategoryIds: HERPETOLOGIST_SUBCATEGORY_IDS,
  },
  {
    id: 'ornithologist',
    label: 'Ornithologist',
    subcategoryIds: ORNITHOLOGIST_SUBCATEGORY_IDS,
  },
  {
    id: 'mammalogist',
    label: 'Mammalogist',
    subcategoryIds: [
      'small_mammals',
      'deer_hoofed',
      'bats',
      'marine_mammals',
      'carnivores',
    ],
  },
];

const ACTIVE_SUBCATEGORIES: readonly SubcategoryDef[] = MAIN_CATEGORIES.flatMap((main) =>
  main.subcategoryIds.map((id) => ({
    id,
    label: subcategoryLabel(id),
    mainId: main.id,
  })),
);

/** Legacy plant subs still stored on older rows; map to botanist but no sub-tier badges. */
const LEGACY_SUBCATEGORIES: readonly SubcategoryDef[] = [
  { id: 'aquatic_plants', label: 'Aquatic Plants', mainId: 'botanist' },
  { id: 'cacti_succulents', label: 'Cacti & Succulents', mainId: 'botanist' },
];

export const SUBCATEGORIES: readonly SubcategoryDef[] = [
  ...ACTIVE_SUBCATEGORIES,
  ...LEGACY_SUBCATEGORIES,
];

const SUB_BY_ID = new Map(SUBCATEGORIES.map((s) => [s.id, s]));
const MAIN_BY_ID = new Map(MAIN_CATEGORIES.map((m) => [m.id, m]));

function subcategoryLabel(id: SubcategoryId): string {
  const labels: Record<SubcategoryId, string> = {
    wildflowers: 'Wildflowers',
    trees_shrubs: 'Trees & Shrubs',
    ferns_mosses: 'Ferns & Mosses',
    aquatic_plants: 'Aquatic Plants',
    cacti_succulents: 'Cacti & Succulents',
    lizards: 'Lizards',
    snakes: 'Snakes',
    frogs_toads: 'Frogs & Toads',
    turtles_tortoises: 'Turtles & Tortoises',
    salamanders: 'Salamanders',
    songbirds: 'Songbirds',
    raptors: 'Raptors',
    wading_birds: 'Wading Birds',
    waterfowl: 'Waterfowl',
    shorebirds: 'Shorebirds',
    small_mammals: 'Small Mammals',
    deer_hoofed: 'Deer & Hoofed',
    bats: 'Bats',
    marine_mammals: 'Marine Mammals',
    carnivores: 'Carnivores',
  };
  return labels[id];
}

export function getMainCategory(id: MainCategoryId): MainCategoryDef {
  const main = MAIN_BY_ID.get(id);
  if (!main) throw new Error(`Unknown main category: ${id}`);
  return main;
}

export function getSubcategory(id: SubcategoryId): SubcategoryDef {
  const sub = SUB_BY_ID.get(id);
  if (!sub) throw new Error(`Unknown subcategory: ${id}`);
  return sub;
}

export function mainCategoryHasSubTierBadges(mainId: MainCategoryId): boolean {
  return SUB_TIER_BADGE_SUBCATEGORY_IDS.some((subId) => getSubcategory(subId).mainId === mainId);
}

export function getSubcategoryLabel(id: string): string {
  return SUB_BY_ID.get(id as SubcategoryId)?.label ?? id.replace(/_/g, ' ');
}

export function tierForSpeciesCount(count: number): CategoryTierId | null {
  if (count >= TIER_SPECIES_THRESHOLDS.voyager) return 'voyager';
  if (count >= TIER_SPECIES_THRESHOLDS.adventurer) return 'adventurer';
  if (count >= TIER_SPECIES_THRESHOLDS.explorer) return 'explorer';
  return null;
}

export function subTierForSpeciesCount(count: number): CategoryTierId | null {
  if (count >= SUB_TIER_SPECIES_THRESHOLDS.voyager) return 'voyager';
  if (count >= SUB_TIER_SPECIES_THRESHOLDS.adventurer) return 'adventurer';
  if (count >= SUB_TIER_SPECIES_THRESHOLDS.explorer) return 'explorer';
  return null;
}

export function tierDisplayName(tier: CategoryTierId): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function mainMilestoneAwardKey(mainId: MainCategoryId, tier: CategoryTierId): string {
  return `main:${mainId}:${tier}`;
}

export function subMilestoneAwardKey(subId: SubcategoryId, tier: CategoryTierId): string {
  return `sub:${subId}:${tier}`;
}

export function trueVoyagerBadgeKey(mainId: MainCategoryId): string {
  return `badge:true_voyager:${mainId}`;
}

export const ENDS_OF_THE_EARTH_BADGE_KEY = 'badge:ends_of_the_earth';
