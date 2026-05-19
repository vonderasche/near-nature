import {
  BADGE_BONUS_POINTS,
  ENDS_OF_THE_EARTH_BADGE_KEY,
  MAIN_CATEGORIES,
  MAIN_TIER_POINTS,
  SUB_TIER_POINTS,
  TIER_SPECIES_THRESHOLDS,
  getSubcategoryLabel,
  mainMilestoneAwardKey,
  subMilestoneAwardKey,
  tierDisplayName,
  trueVoyagerBadgeKey,
  type CategoryTierId,
  type MainCategoryId,
  type SubcategoryId,
} from '@/constants/naturalist-categories';
import type { HeroIconName } from '@/components/ui/hero-icon';
import type { MainCategoryProgress } from '@/lib/profile/categoryProgressTypes';

export type ProfileBadgeItem = {
  id: string;
  label: string;
  shortLabel: string;
  icon: HeroIconName;
  earned: boolean;
  points: number;
  /** Shown under the title when unearned (e.g. species threshold). */
  requirement?: string;
  featured?: boolean;
};

export type ProfileBadgeSection = {
  id: string;
  title: string;
  badges: ProfileBadgeItem[];
};

/** One profile trigger icon; opens a popover with its tier badges. */
export type ProfileBadgeGroup = {
  id: string;
  label: string;
  shortLabel: string;
  triggerIcon: HeroIconName;
  badges: ProfileBadgeItem[];
};

const TIER_ORDER: CategoryTierId[] = ['explorer', 'adventurer', 'voyager'];

const TIER_ICON: Record<CategoryTierId, HeroIconName> = {
  explorer: 'magnifying-glass',
  adventurer: 'bolt',
  voyager: 'trophy',
};

const VOYAGER_ICON_BY_MAIN: Record<MainCategoryId, HeroIconName> = {
  botanist: 'sparkles',
  herpetologist: 'bolt',
  ornithologist: 'eye',
  mammalogist: 'user',
  entomologist: 'bolt',
  arachnologist: 'funnel',
  ichthyologist: 'photo',
  mycologist: 'light-bulb',
};

function tierEarned(
  awardKeys: ReadonlySet<string>,
  awardKey: string,
  speciesCount: number,
  tier: CategoryTierId,
): boolean {
  return awardKeys.has(awardKey) || speciesCount >= TIER_SPECIES_THRESHOLDS[tier];
}

function buildBonusBadges(awardKeys: ReadonlySet<string>): ProfileBadgeItem[] {
  const featured: ProfileBadgeItem = {
    id: ENDS_OF_THE_EARTH_BADGE_KEY,
    label: 'Ends of the Earth',
    shortLabel: 'Ends of Earth',
    icon: 'trophy',
    earned: awardKeys.has(ENDS_OF_THE_EARTH_BADGE_KEY),
    points: BADGE_BONUS_POINTS.endsOfTheEarth,
    requirement: 'Voyager in all 8 disciplines',
    featured: true,
  };

  const voyagers: ProfileBadgeItem[] = MAIN_CATEGORIES.map((main) => {
    const id = trueVoyagerBadgeKey(main.id);
    return {
      id,
      label: `True Voyager — ${main.label}`,
      shortLabel: main.label,
      icon: VOYAGER_ICON_BY_MAIN[main.id],
      earned: awardKeys.has(id),
      points: BADGE_BONUS_POINTS.trueVoyager,
      requirement: 'Main + all sub Voyagers',
    };
  });

  return [featured, ...voyagers];
}

function buildMainTierBadges(
  mains: readonly MainCategoryProgress[],
  awardKeys: ReadonlySet<string>,
): ProfileBadgeItem[] {
  const byId = new Map(mains.map((m) => [m.id, m]));
  const out: ProfileBadgeItem[] = [];

  for (const main of MAIN_CATEGORIES) {
    const progress = byId.get(main.id);
    const speciesCount = progress?.speciesCount ?? 0;
    for (const tier of TIER_ORDER) {
      const id = mainMilestoneAwardKey(main.id, tier);
      out.push({
        id,
        label: `${main.label} ${tierDisplayName(tier)}`,
        shortLabel: `${main.label.slice(0, 4)} ${tierDisplayName(tier).slice(0, 3)}`,
        icon: TIER_ICON[tier],
        earned: tierEarned(awardKeys, id, speciesCount, tier),
        points: MAIN_TIER_POINTS[tier],
        requirement: `${TIER_SPECIES_THRESHOLDS[tier]} species`,
      });
    }
  }

  return out;
}

function buildSubTierBadges(
  mains: readonly MainCategoryProgress[],
  awardKeys: ReadonlySet<string>,
): ProfileBadgeItem[] {
  const out: ProfileBadgeItem[] = [];

  for (const main of MAIN_CATEGORIES) {
    const mainProgress = mains.find((m) => m.id === main.id);
    for (const subId of main.subcategoryIds) {
      const sub = mainProgress?.subcategories.find((s) => s.id === subId);
      const speciesCount = sub?.speciesCount ?? 0;
      for (const tier of TIER_ORDER) {
        const id = subMilestoneAwardKey(subId as SubcategoryId, tier);
        const subLabel = getSubcategoryLabel(subId);
        out.push({
          id,
          label: `${subLabel} ${tierDisplayName(tier)}`,
          shortLabel: subLabel.length > 12 ? `${subLabel.slice(0, 10)}…` : subLabel,
          icon: TIER_ICON[tier],
          earned: tierEarned(awardKeys, id, speciesCount, tier),
          points: SUB_TIER_POINTS[tier],
          requirement: `${TIER_SPECIES_THRESHOLDS[tier]} sp.`,
        });
      }
    }
  }

  return out;
}

/** Full catalog of earnable bonus + milestone badges for the profile grid. */
export function buildProfileBadgeSections(
  mains: readonly MainCategoryProgress[],
  awardKeys: ReadonlySet<string>,
): ProfileBadgeSection[] {
  return [
    {
      id: 'bonus',
      title: 'Bonus badges',
      badges: buildBonusBadges(awardKeys),
    },
    {
      id: 'main-tiers',
      title: 'Main discipline tiers',
      badges: buildMainTierBadges(mains, awardKeys),
    },
    {
      id: 'sub-tiers',
      title: 'Subcategory tiers',
      badges: buildSubTierBadges(mains, awardKeys),
    },
  ];
}

function pickGroupTriggerIcon(
  badges: readonly ProfileBadgeItem[],
  fallback: HeroIconName,
): HeroIconName {
  for (const tier of ['voyager', 'adventurer', 'explorer'] as const) {
    const match = badges.find((b) => b.id.endsWith(`:${tier}`) && b.earned);
    if (match) return match.icon;
  }
  return fallback;
}

function shortLabelFrom(text: string, max = 4): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max);
}

/** Collapse tier rows into one trigger per discipline, subcategory, or bonus block. */
export function buildProfileBadgeGroups(section: ProfileBadgeSection): ProfileBadgeGroup[] {
  if (section.id === 'main-tiers') {
    return MAIN_CATEGORIES.map((main) => {
      const badges = section.badges.filter((b) => b.id.startsWith(`main:${main.id}:`));
      return {
        id: main.id,
        label: main.label,
        shortLabel: shortLabelFrom(main.label),
        triggerIcon: pickGroupTriggerIcon(badges, VOYAGER_ICON_BY_MAIN[main.id]),
        badges,
      };
    });
  }

  if (section.id === 'sub-tiers') {
    return MAIN_CATEGORIES.map((main) => {
      const subIds = new Set(main.subcategoryIds);
      const badges = section.badges.filter((b) => subIds.has(b.id.split(':')[1] as SubcategoryId));
      return {
        id: `sub:${main.id}`,
        label: `${main.label} subcategories`,
        shortLabel: shortLabelFrom(main.label),
        triggerIcon: pickGroupTriggerIcon(badges, VOYAGER_ICON_BY_MAIN[main.id]),
        badges,
      };
    });
  }

  return [
    {
      id: 'bonus',
      label: section.title,
      shortLabel: 'Bonus',
      triggerIcon: pickGroupTriggerIcon(section.badges, 'trophy'),
      badges: section.badges,
    },
  ];
}

/** Compact row for the profile collapsible header: earned badges, or dimmed placeholders. */
export function buildProfileBadgePreviewRow(
  mains: readonly MainCategoryProgress[],
  awardKeys: ReadonlySet<string>,
): ProfileBadgeItem[] {
  const earned = buildProfileBadgeSections(mains, awardKeys)
    .flatMap((section) => section.badges)
    .filter((badge) => badge.earned);

  if (earned.length > 0) {
    return earned;
  }

  return [
    {
      id: 'preview:bonus',
      label: 'Bonus badges',
      shortLabel: 'Bonus',
      icon: 'trophy',
      earned: false,
      points: BADGE_BONUS_POINTS.endsOfTheEarth,
    },
    ...MAIN_CATEGORIES.map((main) => ({
      id: `preview:${main.id}`,
      label: main.label,
      shortLabel: shortLabelFrom(main.label),
      icon: VOYAGER_ICON_BY_MAIN[main.id],
      earned: false,
      points: MAIN_TIER_POINTS.explorer,
    })),
  ];
}

/** Sections containing only badges present in `awardKeys` (for public profiles). */
export function buildEarnedProfileBadgeSections(
  awardKeys: ReadonlySet<string>,
): ProfileBadgeSection[] {
  return buildProfileBadgeSections([], awardKeys)
    .map((section) => ({
      ...section,
      badges: section.badges.filter((badge) => badge.earned),
    }))
    .filter((section) => section.badges.length > 0);
}

export const PROFILE_BADGE_GRID_COLUMNS = 4;

/** @deprecated Use {@link buildProfileBadgeSections} */
export function buildProfileBadgeItems(awardKeys: ReadonlySet<string>): ProfileBadgeItem[] {
  return buildProfileBadgeSections([], awardKeys).flatMap((s) => s.badges);
}
