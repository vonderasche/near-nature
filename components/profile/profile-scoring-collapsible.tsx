import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ProfileBadgeGrid } from '@/components/profile/profile-badge-grid';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { HeroIcon } from '@/components/ui/hero-icon';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useUserScoringSnapshot } from '@/hooks/useUserScoringSnapshot';

type Props = {
  userId: string;
  borderColor: string;
  mutedColor: string;
};

export type ProfileScoringCollapsibleHandle = {
  refetch: () => Promise<void>;
};

export const ProfileScoringCollapsible = forwardRef<
  ProfileScoringCollapsibleHandle,
  Props
>(function ProfileScoringCollapsible({ userId, borderColor, mutedColor }, ref) {
  const [open, setOpen] = useState(false);
  const { snapshot, loading, error, refetch } = useUserScoringSnapshot(open ? userId : undefined);

  const mains = snapshot?.mains ?? [];
  const awardKeys = useMemo(
    () => snapshot?.awardKeys ?? new Set<string>(),
    [snapshot?.awardKeys],
  );

  useImperativeHandle(ref, () => ({ refetch }), [refetch]);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen((wasOpen) => !wasOpen)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={open ? 'Collapse scoring and badges' : 'Expand scoring and badges'}
        style={({ pressed }) => [styles.trigger, { borderColor }, pressed && styles.triggerPressed]}>
        <View style={styles.triggerLeft}>
          <HeroIcon name="trophy" size={20} color={authColors.text} />
          <Text style={styles.triggerTitle}>Scoring & badges</Text>
        </View>
        <View style={open ? styles.chevronExpanded : undefined}>
          <HeroIcon name="chevron-down" size={20} color={mutedColor} />
        </View>
      </Pressable>

      {open ? (
        <View style={styles.body}>
          <Text style={[styles.hint, { color: mutedColor }]}>
            Tap a discipline icon to see its tiers · dimmed = not earned yet
          </Text>

          <ProfileBadgeGrid
            mains={mains}
            awardKeys={awardKeys}
            borderColor={borderColor}
            mutedColor={mutedColor}
          />

          {loading ? (
            <View style={styles.syncRow}>
              <ActivityIndicator size="small" color={mutedColor} />
              <Text style={[styles.syncText, { color: mutedColor }]}>Updating progress…</Text>
            </View>
          ) : null}

          {error ? (
            <ErrorRetryBlock
              message="Couldn't sync progress. Badge icons still show what you can earn."
              onRetry={() => void refetch()}
              borderColor={borderColor}
              retryLabel="Try again"
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
});

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
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  body: {
    gap: authSpacing.sm,
  },
  hint: {
    ...authTypography.subtitle,
    fontSize: 12,
    textAlign: 'center',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: authSpacing.sm,
  },
  syncText: {
    ...authTypography.subtitle,
    fontSize: 12,
  },
});
