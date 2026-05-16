import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExploreSpeciesPager } from '@/components/explore/explore-species-pager';
import { ScreenHeading } from '@/components/screen/screen-heading';
import { authColors, authSpacing } from '@/constants/auth-theme';
import { useExploreSpecies } from '@/hooks/useExploreSpecies';
import { useUserHomeState } from '@/hooks/useUserHomeState';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';
import { stateNameFromCode } from '@/lib/explore/exploreSpeciesTypes';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const edge = contentInsetsPadding(insets);

  const stateCode = useUserHomeState();
  const stateName = stateNameFromCode(stateCode);
  const { byType, isLoading, error, refetch } = useExploreSpecies(stateName);
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
    <View
      style={[
        styles.root,
        {
          paddingTop: edge.paddingTop,
          paddingBottom: edge.paddingBottom + tabBarHeight,
          paddingHorizontal: authSpacing.lg,
        },
      ]}>
      <ScreenHeading
        title="Discover"
        subtitle={`Popular species in ${stateName}. Swipe left or right, or tap Animals / Plants.`}
        marginBottom={authSpacing.md}
      />
      <ExploreSpeciesPager
        byType={byType}
        loading={isLoading}
        error={error}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={authColors.text}
            colors={[authColors.text]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: authColors.background,
  },
});
