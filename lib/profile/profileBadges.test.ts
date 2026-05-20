import { describe, expect, it } from 'vitest';

import { ENDS_OF_THE_EARTH_BADGE_KEY, trueVoyagerBadgeKey } from '@/constants/naturalist-categories';
import {
  buildEarnedProfileBadgeSections,
  buildProfileBadgeGroups,
  buildProfileBadgePreviewRow,
  buildProfileBadgeSections,
} from '@/lib/profile/profileBadges';

describe('buildProfileBadgeSections', () => {
  it('includes bonus, main tier, and sub tier sections with every badge listed', () => {
    const sections = buildProfileBadgeSections([], new Set());
    expect(sections.map((s) => s.id)).toEqual(['bonus', 'main-tiers', 'sub-tiers']);
    expect(sections[0].badges).toHaveLength(9);
    expect(sections[1].badges).toHaveLength(24);
    expect(sections[2].badges.length).toBeGreaterThan(100);
    expect(sections.every((s) => s.badges.every((b) => b.earned === false))).toBe(true);
  });

  it('groups main tiers into one trigger per discipline with three tier badges each', () => {
    const sections = buildProfileBadgeSections([], new Set());
    const mainSection = sections.find((s) => s.id === 'main-tiers')!;
    const groups = buildProfileBadgeGroups(mainSection);
    expect(groups).toHaveLength(8);
    expect(groups.every((g) => g.badges)).toBe(true);
    expect(groups.every((g) => g.badges.length === 3)).toBe(true);
    expect(groups[0].id).toBe('botanist');
  });

  it('groups sub tiers into one trigger per main discipline', () => {
    const sections = buildProfileBadgeSections([], new Set());
    const subSection = sections.find((s) => s.id === 'sub-tiers')!;
    const groups = buildProfileBadgeGroups(subSection);
    expect(groups).toHaveLength(8);
    expect(groups[0].id).toBe('sub:botanist');
    expect(groups[0].badges.length).toBe(15);
  });

  it('groups bonus badges into a single trigger', () => {
    const sections = buildProfileBadgeSections([], new Set());
    const bonusSection = sections.find((s) => s.id === 'bonus')!;
    const groups = buildProfileBadgeGroups(bonusSection);
    expect(groups).toHaveLength(1);
    expect(groups[0].badges).toHaveLength(9);
  });

  it('buildProfileBadgePreviewRow returns dimmed placeholders when nothing earned', () => {
    const row = buildProfileBadgePreviewRow([], new Set());
    expect(row.length).toBe(9);
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
