import {
  MAIN_CATEGORIES,
  MAIN_TIER_POINTS,
  TIER_SPECIES_THRESHOLDS,
  mainMilestoneAwardKey,
  tierDisplayName,
  type CategoryTierId,
} from '@/constants/naturalist-categories';
import type { HeroIconName } from '@/components/ui/hero-icon';
import type { BadgeProgress, MainCategoryProgress } from '@/lib/profile/categoryProgressTypes';

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

const VOYAGER_ICON_BY_MAIN = {
  botanist: 'sparkles',
  herpetologist: 'bolt',
  ornithologist: 'eye',
  mammalogist: 'user',
} as const;

function buildProgressByAward(
  badgeProgress: readonly BadgeProgress[] | undefined,
): ReadonlyMap<string, BadgeProgress> {
  return new Map((badgeProgress ?? []).map((progress) => [progress.awardKey, progress]));
}

function progressSpeciesCount(progress: BadgeProgress | undefined, fallback: number): number {
  return Math.max(0, progress?.uniqueSpeciesCount ?? fallback);
}

function progressRequirement(
  progress: BadgeProgress | undefined,
  fallback: number,
): number {
  return Math.max(1, progress?.requiredUniqueSpecies ?? fallback);
}

function tierEarned(
  awardKeys: ReadonlySet<string>,
  awardKey: string,
  speciesCount: number,
  progress: BadgeProgress | undefined,
  fallbackRequired: number,
): boolean {
  if (progress) {
    return awardKeys.has(awardKey) || progress.earned;
  }

  return awardKeys.has(awardKey) || speciesCount >= fallbackRequired;
}

function buildMainTierBadges(
  mains: readonly MainCategoryProgress[],
  awardKeys: ReadonlySet<string>,
  progressByAward: ReadonlyMap<string, BadgeProgress>,
): ProfileBadgeItem[] {
  const byId = new Map(mains.map((m) => [m.id, m]));
  const out: ProfileBadgeItem[] = [];

  for (const main of MAIN_CATEGORIES) {
    const progress = byId.get(main.id);
    const fallbackSpeciesCount = progress?.speciesCount ?? 0;
    for (const tier of TIER_ORDER) {
      const id = mainMilestoneAwardKey(main.id, tier);
      const badgeProgress = progressByAward.get(id);
      const speciesCount = progressSpeciesCount(badgeProgress, fallbackSpeciesCount);
      const required = progressRequirement(badgeProgress, TIER_SPECIES_THRESHOLDS[tier]);
      out.push({
        id,
        label: badgeProgress?.label || `${main.label} ${tierDisplayName(tier)}`,
        shortLabel: `${main.label.slice(0, 4)} ${tierDisplayName(tier).slice(0, 3)}`,
        icon: TIER_ICON[tier],
        earned: tierEarned(awardKeys, id, speciesCount, badgeProgress, required),
        points: badgeProgress?.points ?? MAIN_TIER_POINTS[tier],
        requirement: `${required} species`,
      });
    }
  }

  return out;
}

/** Full catalog of earnable bonus + milestone badges for the profile grid. */
export function buildProfileBadgeSections(
  mains: readonly MainCategoryProgress[],
  awardKeys: ReadonlySet<string>,
  badgeProgress?: readonly BadgeProgress[],
): ProfileBadgeSection[] {
  const progressByAward = buildProgressByAward(badgeProgress);

  return [
    {
      id: 'main-tiers',
      title: 'Main discipline tiers',
      badges: buildMainTierBadges(mains, awardKeys, progressByAward),
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
  return MAIN_CATEGORIES.map((main) => {
    const badges = section.badges.filter((b) => b.id.startsWith(`main:${main.id}:`));
    return {
      id: main.id,
      label: main.label,
      shortLabel: main.label,
      triggerIcon: pickGroupTriggerIcon(badges, VOYAGER_ICON_BY_MAIN[main.id]),
      badges,
    };
  });
}

/** Compact row for the profile collapsible header: earned badges, or dimmed placeholders. */
export function buildProfileBadgePreviewRow(
  mains: readonly MainCategoryProgress[],
  awardKeys: ReadonlySet<string>,
  badgeProgress?: readonly BadgeProgress[],
): ProfileBadgeItem[] {
  const earned = buildProfileBadgeSections(mains, awardKeys, badgeProgress)
    .flatMap((section) => section.badges)
    .filter((badge) => badge.earned);

  if (earned.length > 0) {
    return earned;
  }

  return MAIN_CATEGORIES.map((main) => ({
    id: `preview:${main.id}`,
    label: main.label,
    shortLabel: shortLabelFrom(main.label),
    icon: VOYAGER_ICON_BY_MAIN[main.id],
    earned: false,
    points: MAIN_TIER_POINTS.explorer,
  }));
}

/** Sections containing only badges present in `awardKeys` (for public profiles). */
export function buildEarnedProfileBadgeSections(
  awardKeys: ReadonlySet<string>,
  badgeProgress?: readonly BadgeProgress[],
): ProfileBadgeSection[] {
  return buildProfileBadgeSections([], awardKeys, badgeProgress)
    .map((section) => ({
      ...section,
      badges: section.badges.filter((badge) => badge.earned),
    }))
    .filter((section) => section.badges.length > 0);
}

export const PROFILE_BADGE_GRID_COLUMNS = 4;
