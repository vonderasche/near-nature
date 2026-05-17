import { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';

type Options = {
  tintColor?: string;
  colors?: string[];
};

/**
 * Wraps an async refetch in a React Native `RefreshControl`.
 */
export function useRefreshControl(refetch: () => Promise<void>, options: Options = {}) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={options.tintColor}
      colors={options.colors}
    />
  );

  return { refreshing, onRefresh, refreshControl };
}
