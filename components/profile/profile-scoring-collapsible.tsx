import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ProfileBadgeGrid } from '@/components/profile/profile-badge-grid';
import { ProfileBadgePreviewRow } from '@/components/profile/profile-badge-preview-row';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { HeroIcon } from '@/components/ui/hero-icon';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { buildProfileBadgePreviewRow } from '@/lib/profile/profileBadges';
import { useUserScoringSnapshot } from '@/hooks/useUserScoringSnapshot';

type Props = {
  userId: string;
};

export type ProfileScoringCollapsibleHandle = {
  refetch: () => Promise<void>;
};

export const ProfileScoringCollapsible = forwardRef<
  ProfileScoringCollapsibleHandle,
  Props
>(function ProfileScoringCollapsible({ userId }, ref) {
  const { snapshot, loading, error, refetch } = useUserScoringSnapshot(userId);

  const mains = useMemo(() => snapshot?.mains ?? [], [snapshot]);
  const hasSavedSpecies = (snapshot?.breakdown.totalSpecies ?? 0) > 0;
  const awardKeys = useMemo(
    () => snapshot?.awardKeys ?? new Set<string>(),
    [snapshot?.awardKeys],
  );
  const badgeProgress = useMemo(() => snapshot?.badgeProgress ?? [], [snapshot]);

  const previewBadges = useMemo(
    () => buildProfileBadgePreviewRow(mains, awardKeys, badgeProgress),
    [awardKeys, badgeProgress, mains],
  );

  useImperativeHandle(ref, () => ({ refetch }), [refetch]);

  return (
    <View style={styles.wrap}>
      <View style={styles.preview}>
        {loading && !snapshot ? (
          <View style={styles.previewLoading}>
            <ActivityIndicator size="small" color={authColors.textMuted} />
          </View>
        ) : (
          <ProfileBadgePreviewRow badges={previewBadges} />
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.hint}>
          {hasSavedSpecies
            ? 'Tap a discipline icon to see its tiers · dimmed = not earned yet'
            : 'Save your first identification to start earning badge progress.'}
        </Text>

        <ProfileBadgeGrid mains={mains} awardKeys={awardKeys} badgeProgress={badgeProgress} />

        {loading ? (
          <View style={styles.syncRow}>
            <ActivityIndicator size="small" color={authColors.textMuted} />
            <Text style={styles.syncText}>Updating progress…</Text>
          </View>
        ) : null}

        {error ? (
          <ErrorRetryBlock
            message="Couldn't sync progress. Badge icons still show what you can earn."
            onRetry={() => void refetch()}
            retryLabel="Try again"
          />
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: authSpacing.sm,
    marginBottom: authSpacing.md,
  },
  preview: {
    paddingVertical: authSpacing.sm,
  },
  previewLoading: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    gap: authSpacing.sm,
  },
  hint: {
    ...authTypography.subtitle,
    fontSize: 12,
    textAlign: 'center',
    color: authColors.textMuted,
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
    color: authColors.textMuted,
  },
});
