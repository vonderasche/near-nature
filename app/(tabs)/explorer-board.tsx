import { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';

import { TabScreenWithLogout } from '@/components/TabScreenWithLogout';
import { DetectionCountExplorerBoard } from '@/components/explorer-board/detection-count-explorer-board';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDetectionLeaderboard } from '@/hooks/useDetectionLeaderboard';

export default function ExplorerBoardScreen() {
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
      title="Explorer Board"
      subtitle="Ranked by distinct native species discovered. Each row shows points, species counts, and recent identification previews."
      hideLogout
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tint}
          colors={[tint]}
        />
      }>
      <DetectionCountExplorerBoard rows={rows} loading={isLoading} error={error} />
    </TabScreenWithLogout>
  );
}
