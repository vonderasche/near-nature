import { describe, expect, it } from 'vitest';

import {
  buildEarnedProfileBadgeSections,
  buildProfileBadgeGroups,
  buildProfileBadgePreviewRow,
  buildProfileBadgeSections,
} from '@/lib/profile/profileBadges';
import type { BadgeProgress } from '@/lib/profile/categoryProgressTypes';

describe('buildProfileBadgeSections', () => {
  it('includes only main tier section with four disciplines', () => {
    const sections = buildProfileBadgeSections([], new Set());
    expect(sections.map((s) => s.id)).toEqual(['main-tiers']);
    expect(sections[0].badges).toHaveLength(12);
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
        uniqueSpeciesCount: 1,
        requiredUniqueSpecies: 1,
        earned: true,
      },
    ];

    const sections = buildProfileBadgeSections([], new Set(), progress);
    const mainSection = sections.find((s) => s.id === 'main-tiers')!;
    const botanist = mainSection.badges.find((b) => b.id === 'main:botanist:explorer')!;
    expect(botanist.earned).toBe(true);
    expect(botanist.points).toBe(50);
  });

  it('buildProfileBadgePreviewRow returns dimmed placeholders when nothing earned', () => {
    const row = buildProfileBadgePreviewRow([], new Set());
    expect(row.length).toBe(4);
    expect(row.every((b) => !b.earned)).toBe(true);
    expect(row[0].id).toBe('preview:botanist');
  });

  it('buildProfileBadgePreviewRow returns earned badges when present', () => {
    const keys = new Set(['main:botanist:explorer']);
    const row = buildProfileBadgePreviewRow([], keys);
    expect(row).toHaveLength(1);
    expect(row[0].earned).toBe(true);
  });

  it('buildEarnedProfileBadgeSections omits unearned badges and empty sections', () => {
    const keys = new Set(['main:botanist:explorer']);
    const sections = buildEarnedProfileBadgeSections(keys);
    expect(sections.map((s) => s.id)).toEqual(['main-tiers']);
    expect(sections[0].badges).toHaveLength(1);
    expect(sections[0].badges.every((b) => b.earned)).toBe(true);
  });

  it('marks earned badges from award keys', () => {
    const keys = new Set(['main:botanist:explorer']);
    const sections = buildProfileBadgeSections([], keys);
    const main = sections[0].badges;
    expect(main.find((b) => b.id === 'main:botanist:explorer')?.earned).toBe(true);
    expect(main.find((b) => b.id === 'main:ornithologist:explorer')?.earned).toBe(false);
  });
});
