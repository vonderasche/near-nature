import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ProfileBadgeTile } from '@/components/profile/profile-badge-tile';
import { authSpacing } from '@/constants/auth-theme';
import type { BadgeProgress, MainCategoryProgress } from '@/lib/profile/categoryProgressTypes';
import {
  buildProfileBadgeSections,
  PROFILE_BADGE_GRID_COLUMNS,
} from '@/lib/profile/profileBadges';

type Props = {
  mains: readonly MainCategoryProgress[];
  awardKeys: ReadonlySet<string>;
  badgeProgress?: readonly BadgeProgress[];
};

export function ProfileBadgeGrid({ mains, awardKeys, badgeProgress }: Props) {
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
        <View key={section.id} style={styles.section}>
          <View style={[styles.grid, { gap }]}>
            {section.badges.map((badge) => (
              <ProfileBadgeTile key={badge.id} badge={badge} size={tileSize} />
            ))}
          </View>
        </View>
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
  },
});
