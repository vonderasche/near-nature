import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { ProfileBadgeTile } from '@/components/profile/profile-badge-tile';
import { HeroIcon } from '@/components/ui/hero-icon';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { usePublicUserAwards } from '@/hooks/usePublicUserAwards';
import {
  buildEarnedProfileBadgeSections,
  PROFILE_BADGE_GRID_COLUMNS,
} from '@/lib/profile/profileBadges';

type Props = {
  userId: string;
  borderColor: string;
  mutedColor: string;
};

export type ProfileEarnedBadgesSectionHandle = {
  refetch: () => Promise<void>;
};

export const ProfileEarnedBadgesSection = forwardRef<ProfileEarnedBadgesSectionHandle, Props>(
  function ProfileEarnedBadgesSection({ userId, borderColor, mutedColor }, ref) {
    const [open, setOpen] = useState(false);
    const { awardKeys, earnedCount, loading, error, refetch } = usePublicUserAwards(userId);
    const { width: windowWidth } = useWindowDimensions();

    const sections = useMemo(() => buildEarnedProfileBadgeSections(awardKeys), [awardKeys]);

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
        <Pressable
          onPress={() => setOpen((wasOpen) => !wasOpen)}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={open ? 'Collapse badges' : 'Expand badges'}
          style={({ pressed }) => [styles.trigger, { borderColor }, pressed && styles.triggerPressed]}>
          <View style={styles.triggerLeft}>
            <HeroIcon name="trophy" size={20} color={authColors.text} />
            <Text style={styles.triggerTitle}>Badges</Text>
            {!open && earnedCount > 0 ? (
              <Text style={[styles.triggerMeta, { color: mutedColor }]}>
                {earnedCount} earned
              </Text>
            ) : null}
          </View>
          <View style={open ? styles.chevronExpanded : undefined}>
            <HeroIcon name="chevron-down" size={20} color={mutedColor} />
          </View>
        </Pressable>

        {open ? (
          <View style={styles.body}>
            {loading ? (
              <View style={styles.syncRow}>
                <ActivityIndicator size="small" color={mutedColor} />
              </View>
            ) : null}

            {error ? (
              <ErrorRetryBlock
                message="Couldn't load badges."
                onRetry={() => void refetch()}
                borderColor={borderColor}
                retryLabel="Try again"
              />
            ) : null}

            {!loading && !error
              ? sections.map((section) => (
                  <View key={section.id} style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: authColors.text }]}>
                      {section.title}
                    </Text>
                    <View style={[styles.grid, { gap }]}>
                      {section.badges.map((badge) =>
                        badge.featured ? (
                          <ProfileBadgeTile
                            key={badge.id}
                            badge={badge}
                            size={innerWidth}
                            borderColor={borderColor}
                          />
                        ) : (
                          <ProfileBadgeTile
                            key={badge.id}
                            badge={badge}
                            size={tileSize}
                            borderColor={borderColor}
                            compact={section.id === 'sub-tiers'}
                          />
                        ),
                      )}
                    </View>
                  </View>
                ))
              : null}
          </View>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrap: {
    gap: authSpacing.sm,
    marginBottom: authSpacing.md,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: authSpacing.sm,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.md,
    borderWidth: 1,
    borderRadius: 4,
  },
  triggerPressed: {
    opacity: 0.88,
  },
  triggerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.sm,
  },
  triggerTitle: {
    ...authTypography.subtitle,
    fontWeight: '600',
    color: authColors.text,
  },
  triggerMeta: {
    ...authTypography.subtitle,
    fontSize: 12,
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
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
  sectionTitle: {
    ...authTypography.subtitle,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
