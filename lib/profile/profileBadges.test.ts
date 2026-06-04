import { describe, expect, it } from 'vitest';

import {
  buildEarnedProfileBadgeSections,
  buildProfileBadgePreviewRow,
  buildProfileBadgeSections,
} from '@/lib/profile/profileBadges';
import type { BadgeProgress } from '@/lib/profile/categoryProgressTypes';

describe('buildProfileBadgeSections', () => {
  it('includes one badge per main discipline', () => {
    const sections = buildProfileBadgeSections([], new Set());
    expect(sections.map((s) => s.id)).toEqual(['main-tiers']);
    expect(sections[0].badges).toHaveLength(4);
    expect(sections[0].badges.map((b) => b.id)).toEqual([
      'main:botanist:explorer',
      'main:herpetologist:explorer',
      'main:ornithologist:explorer',
      'main:mammalogist:explorer',
    ]);
    expect(sections.every((s) => s.badges.every((b) => b.earned === false))).toBe(true);
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
    const botanist = sections[0].badges.find((b) => b.id === 'main:botanist:explorer')!;
    expect(botanist.earned).toBe(true);
    expect(botanist.label).toBe('Botanist');
    expect(botanist.points).toBe(50);
  });

  it('buildProfileBadgePreviewRow returns dimmed placeholders when nothing earned', () => {
    const row = buildProfileBadgePreviewRow([], new Set());
    expect(row.length).toBe(4);
    expect(row.every((b) => !b.earned)).toBe(true);
    expect(row[0].id).toBe('preview:botanist');
  });

  it('buildProfileBadgePreviewRow returns earned badges when present', () => {
    const keys = new Set(['main:herpetologist:explorer']);
    const row = buildProfileBadgePreviewRow([], keys);
    expect(row).toHaveLength(1);
    expect(row[0].earned).toBe(true);
    expect(row[0].label).toContain('Herpetologist');
  });

  it('buildEarnedProfileBadgeSections omits unearned badges and empty sections', () => {
    const keys = new Set(['main:botanist:explorer']);
    const sections = buildEarnedProfileBadgeSections(keys);
    expect(sections.map((s) => s.id)).toEqual(['main-tiers']);
    expect(sections[0].badges).toHaveLength(1);
    expect(sections[0].badges.every((b) => b.earned)).toBe(true);
  });

  it('marks herpetologist earned from award keys', () => {
    const keys = new Set(['main:herpetologist:explorer']);
    const sections = buildProfileBadgeSections([], keys);
    const herp = sections[0].badges.find((b) => b.id === 'main:herpetologist:explorer')!;
    expect(herp.earned).toBe(true);
    expect(sections[0].badges.find((b) => b.id === 'main:ornithologist:explorer')?.earned).toBe(
      false,
    );
  });
});
