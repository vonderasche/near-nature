import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ProfileBadgeGrid } from '@/components/profile/profile-badge-grid';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { useTheme } from '@/hooks/useTheme';
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
  const { theme } = useTheme();
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
    <View style={[styles.wrap, { gap: theme.spacing.sm, marginBottom: theme.spacing.md }]}>
      <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
        {hasSavedSpecies
          ? 'Earn a discipline badge with your first unique species in that group · dimmed = not earned yet'
          : 'Save your first identification to start earning badge progress.'}
      </Text>

      {loading && !snapshot ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={theme.colors.textSecondary} />
        </View>
      ) : (
        <ProfileBadgeGrid mains={mains} awardKeys={awardKeys} badgeProgress={badgeProgress} />
      )}

      {loading && snapshot ? (
        <View style={[styles.syncRow, { gap: theme.spacing.sm }]}>
          <ActivityIndicator size="small" color={theme.colors.textSecondary} />
          <Text style={[styles.syncText, { color: theme.colors.textSecondary }]}>Updating progress…</Text>
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
  wrap: {},
  loading: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncText: {
    fontSize: 12,
  },
});
