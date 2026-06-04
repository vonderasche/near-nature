import {
  MAIN_CATEGORIES,
  MAIN_TIER_POINTS,
  TIER_SPECIES_THRESHOLDS,
  mainMilestoneAwardKey,
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

const TIER_ORDER: CategoryTierId[] = ['explorer', 'adventurer', 'voyager'];

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

function isMainDisciplineEarned(
  mainId: (typeof MAIN_CATEGORIES)[number]['id'],
  awardKeys: ReadonlySet<string>,
  progressByAward: ReadonlyMap<string, BadgeProgress>,
  fallbackSpeciesCount: number,
): boolean {
  for (const tier of TIER_ORDER) {
    const id = mainMilestoneAwardKey(mainId, tier);
    const progress = progressByAward.get(id);
    if (awardKeys.has(id) || progress?.earned) return true;
    if (
      progress &&
      progressSpeciesCount(progress, fallbackSpeciesCount) >=
        progressRequirement(progress, TIER_SPECIES_THRESHOLDS[tier])
    ) {
      return true;
    }
  }
  return false;
}

/** One earnable badge per main discipline (explorer tier in DB; no sub-tier popover). */
function buildMainDisciplineBadges(
  mains: readonly MainCategoryProgress[],
  awardKeys: ReadonlySet<string>,
  progressByAward: ReadonlyMap<string, BadgeProgress>,
): ProfileBadgeItem[] {
  const byId = new Map(mains.map((m) => [m.id, m]));

  return MAIN_CATEGORIES.map((main) => {
    const progress = byId.get(main.id);
    const fallbackSpeciesCount = progress?.speciesCount ?? 0;
    const explorerKey = mainMilestoneAwardKey(main.id, 'explorer');
    const badgeProgress = progressByAward.get(explorerKey);
    const required = progressRequirement(badgeProgress, TIER_SPECIES_THRESHOLDS.explorer);
    const earned = isMainDisciplineEarned(
      main.id,
      awardKeys,
      progressByAward,
      fallbackSpeciesCount,
    );

    return {
      id: explorerKey,
      label: badgeProgress?.label?.replace(/\s+Explorer$/i, '') || main.label,
      shortLabel: main.label,
      icon: VOYAGER_ICON_BY_MAIN[main.id],
      earned,
      points: badgeProgress?.points ?? MAIN_TIER_POINTS.explorer,
      requirement: earned ? undefined : `${required} species`,
    };
  });
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
      title: 'Discipline badges',
      badges: buildMainDisciplineBadges(mains, awardKeys, progressByAward),
    },
  ];
}

function shortLabelFrom(text: string, max = 4): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max);
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
