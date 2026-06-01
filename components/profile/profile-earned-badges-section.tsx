import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { ProfileBadgeTile } from '@/components/profile/profile-badge-tile';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { usePublicUserAwards } from '@/hooks/usePublicUserAwards';
import {
  buildEarnedProfileBadgeSections,
  PROFILE_BADGE_GRID_COLUMNS,
} from '@/lib/profile/profileBadges';

type Props = {
  userId: string;
};

export type ProfileEarnedBadgesSectionHandle = {
  refetch: () => Promise<void>;
};

export const ProfileEarnedBadgesSection = forwardRef<ProfileEarnedBadgesSectionHandle, Props>(
  function ProfileEarnedBadgesSection({ userId }, ref) {
    const { awardKeys, badgeProgress, earnedCount, loading, error, refetch } =
      usePublicUserAwards(userId);
    const { width: windowWidth } = useWindowDimensions();

    const sections = useMemo(
      () => buildEarnedProfileBadgeSections(awardKeys, badgeProgress),
      [awardKeys, badgeProgress],
    );

    const horizontalPadding = authSpacing.lg * 2;
    const gap = authSpacing.sm;
    const cols = PROFILE_BADGE_GRID_COLUMNS;
    const innerWidth = Math.max(280, windowWidth - horizontalPadding);
    const tileSize = Math.max(64, Math.floor((innerWidth - gap * (cols - 1)) / cols));

    useImperativeHandle(ref, () => ({ refetch }), [refetch]);

    if (!loading && !error && earnedCount === 0) {
      return null;
    }

    return (
      <View style={styles.wrap}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Badges</Text>
        </View>

        <View style={styles.body}>
          {loading ? (
            <View style={styles.syncRow}>
              <ActivityIndicator size="small" color={authColors.textMuted} />
            </View>
          ) : null}

          {error ? (
            <ErrorRetryBlock
              message="Couldn't load badges."
              onRetry={() => void refetch()}
              retryLabel="Try again"
            />
          ) : null}

          {!loading && !error
            ? sections.map((section) => (
                <View key={section.id} style={styles.section}>
                  <View style={[styles.grid, { gap }]}>
                    {section.badges.map((badge) => (
                      <ProfileBadgeTile key={badge.id} badge={badge} size={tileSize} />
                    ))}
                  </View>
                </View>
              ))
            : null}
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrap: {
    gap: authSpacing.sm,
    marginBottom: authSpacing.md,
  },
  header: {
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.md,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: authColors.border,
  },
  headerTitle: {
    ...authTypography.subtitle,
    fontWeight: '600',
    color: authColors.text,
  },
  body: {
    gap: authSpacing.md,
  },
  syncRow: {
    alignItems: 'center',
    paddingVertical: authSpacing.sm,
  },
  section: {
    gap: authSpacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
