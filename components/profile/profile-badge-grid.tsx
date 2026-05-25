import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ProfileBadgeGroupMenu } from '@/components/profile/profile-badge-group-menu';
import { authSpacing } from '@/constants/auth-theme';
import type { BadgeProgress, MainCategoryProgress } from '@/lib/profile/categoryProgressTypes';
import {
  buildProfileBadgeGroups,
  buildProfileBadgeSections,
  PROFILE_BADGE_GRID_COLUMNS,
  type ProfileBadgeSection,
} from '@/lib/profile/profileBadges';

type Props = {
  mains: readonly MainCategoryProgress[];
  awardKeys: ReadonlySet<string>;
  badgeProgress?: readonly BadgeProgress[];
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

  return (
    <View style={styles.section}>
      <View style={styles.grid}>
        {groups.map((group) => (
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
  badgeProgress,
  borderColor,
  mutedColor,
  compact: compactProp,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const sections = useMemo(
    () => buildProfileBadgeSections(mains, awardKeys, badgeProgress),
    [awardKeys, badgeProgress, mains],
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: authSpacing.sm,
  },
});
