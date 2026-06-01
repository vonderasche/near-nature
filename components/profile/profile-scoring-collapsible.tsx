import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ProfileBadgeGrid } from '@/components/profile/profile-badge-grid';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
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

  useImperativeHandle(ref, () => ({ refetch }), [refetch]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>
        {hasSavedSpecies
          ? 'Tap a discipline icon to see its tiers · dimmed = not earned yet'
          : 'Save your first identification to start earning badge progress.'}
      </Text>

      {loading && !snapshot ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={authColors.textMuted} />
        </View>
      ) : (
        <ProfileBadgeGrid mains={mains} awardKeys={awardKeys} badgeProgress={badgeProgress} />
      )}

      {loading && snapshot ? (
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
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: authSpacing.sm,
    marginBottom: authSpacing.md,
  },
  loading: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
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
