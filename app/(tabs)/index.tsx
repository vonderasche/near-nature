import { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';

import { TabScreenWithLogout } from '@/components/TabScreenWithLogout';
import { DetectionCountLeaderboard } from '@/components/leaderboard/detection-count-leaderboard';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDetectionLeaderboard } from '@/hooks/useDetectionLeaderboard';

export default function LeaderboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const tint = Colors[colorScheme].tint;
  const { rows, isLoading, error, refetch } = useDetectionLeaderboard();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return (
    <TabScreenWithLogout
      title="Leaderboard"
      subtitle="Ranked by distinct native species discovered. Each row shows native and non-native species counts."
      hideLogout
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tint}
          colors={[tint]}
        />
      }>
      <DetectionCountLeaderboard rows={rows} loading={isLoading} error={error} />
    </TabScreenWithLogout>
  );
}
