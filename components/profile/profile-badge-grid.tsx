import { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ProfileBadgeGroupMenu } from '@/components/profile/profile-badge-group-menu';
import { ProfileBadgeStatusTile } from '@/components/profile/profile-badge-status-tile';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { MainCategoryProgress } from '@/lib/profile/categoryProgressTypes';
import {
  buildProfileBadgeGroups,
  buildProfileBadgeSections,
  PROFILE_BADGE_GRID_COLUMNS,
  type ProfileBadgeSection,
} from '@/lib/profile/profileBadges';

type Props = {
  mains: readonly MainCategoryProgress[];
  awardKeys: ReadonlySet<string>;
  borderColor: string;
  mutedColor: string;
  compact?: boolean;
};

function BadgeSectionGroups({
  section,
  tileSize,
  borderColor,
  mutedColor,
  compact,
}: {
  section: ProfileBadgeSection;
  tileSize: number;
  borderColor: string;
  mutedColor: string;
  compact: boolean;
}) {
  const groups = useMemo(() => buildProfileBadgeGroups(section), [section]);
  const earned = section.badges.filter((b) => b.earned).length;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: authColors.text }]}>{section.title}</Text>
      <Text style={[styles.sectionHint, { color: mutedColor }]}>
        {section.id === 'sub-tiers'
          ? `${earned} of ${section.badges.length} earned`
          : `${earned} of ${section.badges.length} earned · tap an icon for tiers`}
      </Text>
      <View style={styles.grid}>
        {section.id === 'sub-tiers'
          ? section.badges.map((badge) => (
              <ProfileBadgeStatusTile
                key={badge.id}
                badge={badge}
                size={tileSize}
                mutedColor={mutedColor}
                compact={compact}
              />
            ))
          : groups.map((group) => (
              <ProfileBadgeGroupMenu
                key={group.id}
                group={group}
                size={tileSize}
                borderColor={borderColor}
                mutedColor={mutedColor}
                compact={compact}
              />
            ))}
      </View>
    </View>
  );
}

export function ProfileBadgeGrid({
  mains,
  awardKeys,
  borderColor,
  mutedColor,
  compact: compactProp,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const sections = useMemo(
    () => buildProfileBadgeSections(mains, awardKeys),
    [awardKeys, mains],
  );

  const horizontalPadding = authSpacing.lg * 2;
  const gap = authSpacing.sm;
  const cols = PROFILE_BADGE_GRID_COLUMNS;
  const innerWidth = Math.max(280, windowWidth - horizontalPadding);
  const tileSize = Math.max(64, Math.floor((innerWidth - gap * (cols - 1)) / cols));

  return (
    <View style={styles.wrap}>
      {sections.map((section) => (
        <BadgeSectionGroups
          key={section.id}
          section={section}
          tileSize={tileSize}
          borderColor={borderColor}
          mutedColor={mutedColor}
          compact={compactProp ?? section.id === 'sub-tiers'}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: authSpacing.lg,
  },
  section: {
    gap: authSpacing.sm,
  },
  sectionTitle: {
    ...authTypography.subtitle,
    fontWeight: '700',
  },
  sectionHint: {
    ...authTypography.subtitle,
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: authSpacing.sm,
  },
});
