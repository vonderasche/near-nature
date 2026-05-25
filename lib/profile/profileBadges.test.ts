import { describe, expect, it } from 'vitest';

import { ENDS_OF_THE_EARTH_BADGE_KEY, trueVoyagerBadgeKey } from '@/constants/naturalist-categories';
import {
  buildEarnedProfileBadgeSections,
  buildProfileBadgeGroups,
  buildProfileBadgePreviewRow,
  buildProfileBadgeSections,
} from '@/lib/profile/profileBadges';
import type { BadgeProgress, MainCategoryProgress } from '@/lib/profile/categoryProgressTypes';

describe('buildProfileBadgeSections', () => {
  it('includes bonus, main tier, and sub tier sections with every badge listed', () => {
    const sections = buildProfileBadgeSections([], new Set());
    expect(sections.map((s) => s.id)).toEqual(['bonus', 'main-tiers', 'sub-tiers']);
    expect(sections[0].badges).toHaveLength(5);
    expect(sections[1].badges).toHaveLength(12);
    expect(sections[2].badges).toHaveLength(13);
    expect(sections.every((s) => s.badges.every((b) => b.earned === false))).toBe(true);
  });

  it('groups main tiers into one trigger per discipline with three tier badges each', () => {
    const sections = buildProfileBadgeSections([], new Set());
    const mainSection = sections.find((s) => s.id === 'main-tiers')!;
    const groups = buildProfileBadgeGroups(mainSection);
    expect(groups).toHaveLength(4);
    expect(groups.every((g) => g.badges)).toBe(true);
    expect(groups.every((g) => g.badges.length === 3)).toBe(true);
    expect(groups[0].id).toBe('botanist');
  });

  it('groups sub tiers into one entry per subcategory', () => {
    const sections = buildProfileBadgeSections([], new Set());
    const subSection = sections.find((s) => s.id === 'sub-tiers')!;
    const groups = buildProfileBadgeGroups(subSection);
    expect(groups).toHaveLength(13);
    expect(groups.every((g) => g.badges.length === 1)).toBe(true);
    expect(groups[0].label).toBe('Wildflowers');
    expect(groups[0].triggerIcon).toBe('sparkles');
    expect(groups[3].label).toBe('Lizards');
    expect(groups[3].triggerIcon).toBe('bolt');
    expect(groups[8].label).toBe('Songbirds');
    expect(groups[8].triggerIcon).toBe('eye');
  });

  it('marks subcategory badges earned at three species', () => {
    const botanistProgress: MainCategoryProgress = {
      id: 'botanist',
      label: 'Botanist',
      speciesCount: 3,
      tier: null,
      progressPct: 6,
      subcategories: [
        {
          id: 'wildflowers',
          label: 'Wildflowers',
          speciesCount: 3,
          tier: 'explorer',
          progressPct: 6,
        },
      ],
    };

    const sections = buildProfileBadgeSections([botanistProgress], new Set());
    const subSection = sections.find((s) => s.id === 'sub-tiers')!;
    const wildflowers = subSection.badges.find((b) => b.id === 'sub:wildflowers:explorer')!;
    expect(wildflowers.earned).toBe(true);
  });

  it('uses DB-backed subcategory progress requirements when available', () => {
    const progress: BadgeProgress[] = [
      {
        awardKey: 'sub:wildflowers:explorer',
        badgeKind: 'sub',
        mainCategory: 'botanist',
        subcategory: 'wildflowers',
        tier: 'explorer',
        label: 'Wildflowers Explorer',
        points: 25,
        uniqueSpeciesCount: 2,
        requiredUniqueSpecies: 5,
        earned: false,
      },
    ];

    const sections = buildProfileBadgeSections([], new Set(), progress);
    const subSection = sections.find((s) => s.id === 'sub-tiers')!;
    const wildflowers = subSection.badges.find((b) => b.id === 'sub:wildflowers:explorer')!;
    expect(wildflowers.earned).toBe(false);
    expect(wildflowers.requirement).toBe('5 species');
  });

  it('marks badges earned from DB-backed progress rows', () => {
    const progress: BadgeProgress[] = [
      {
        awardKey: 'main:botanist:explorer',
        badgeKind: 'main',
        mainCategory: 'botanist',
        subcategory: null,
        tier: 'explorer',
        label: 'Botanist Explorer',
        points: 50,
        uniqueSpeciesCount: 10,
        requiredUniqueSpecies: 10,
        earned: true,
      },
    ];

    const sections = buildProfileBadgeSections([], new Set(), progress);
    const mainSection = sections.find((s) => s.id === 'main-tiers')!;
    const botanist = mainSection.badges.find((b) => b.id === 'main:botanist:explorer')!;
    expect(botanist.earned).toBe(true);
    expect(botanist.points).toBe(50);
  });

  it('groups bonus badges into a single trigger', () => {
    const sections = buildProfileBadgeSections([], new Set());
    const bonusSection = sections.find((s) => s.id === 'bonus')!;
    const groups = buildProfileBadgeGroups(bonusSection);
    expect(groups).toHaveLength(1);
    expect(groups[0].badges).toHaveLength(5);
  });

  it('buildProfileBadgePreviewRow returns dimmed placeholders when nothing earned', () => {
    const row = buildProfileBadgePreviewRow([], new Set());
    expect(row.length).toBe(5);
    expect(row.every((b) => !b.earned)).toBe(true);
    expect(row[0].id).toBe('preview:bonus');
  });

  it('buildProfileBadgePreviewRow returns earned badges when present', () => {
    const keys = new Set([ENDS_OF_THE_EARTH_BADGE_KEY]);
    const row = buildProfileBadgePreviewRow([], keys);
    expect(row).toHaveLength(1);
    expect(row[0].earned).toBe(true);
  });

  it('buildEarnedProfileBadgeSections omits unearned badges and empty sections', () => {
    const keys = new Set([ENDS_OF_THE_EARTH_BADGE_KEY, trueVoyagerBadgeKey('botanist')]);
    const sections = buildEarnedProfileBadgeSections(keys);
    expect(sections.map((s) => s.id)).toEqual(['bonus']);
    expect(sections[0].badges).toHaveLength(2);
    expect(sections[0].badges.every((b) => b.earned)).toBe(true);
  });

  it('marks earned badges from award keys', () => {
    const keys = new Set([
      ENDS_OF_THE_EARTH_BADGE_KEY,
      trueVoyagerBadgeKey('botanist'),
    ]);
    const sections = buildProfileBadgeSections([], keys);
    const bonus = sections[0].badges;
    expect(bonus.find((b) => b.id === ENDS_OF_THE_EARTH_BADGE_KEY)?.earned).toBe(true);
    expect(bonus.find((b) => b.id === trueVoyagerBadgeKey('botanist'))?.earned).toBe(true);
    expect(bonus.find((b) => b.id === trueVoyagerBadgeKey('ornithologist'))?.earned).toBe(false);
  });
});
