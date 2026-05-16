import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiscoverMissingStatePrompt } from '@/components/discover/discover-missing-state-prompt';
import { ExploreSpeciesPager } from '@/components/explore/explore-species-pager';
import { CenteredActivityIndicator } from '@/components/profile/centered-activity-indicator';
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

  const { stateCode, hasHomeState, loading: stateLoading } = useUserHomeState();
  const stateName = stateNameFromCode(stateCode);
  const { byType, isLoading, error, refetch } = useExploreSpecies(hasHomeState ? stateName : null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const subtitle = hasHomeState
    ? `Popular species in ${stateName}. Swipe left or right, or tap Animals / Plants.`
    : 'Add your home state on Profile to see species for your area.';

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
      <ScreenHeading title="Discover" subtitle={subtitle} marginBottom={authSpacing.md} />
      {stateLoading ? (
        <CenteredActivityIndicator color={authColors.text} accessibilityLabel="Loading home state" />
      ) : !hasHomeState ? (
        <DiscoverMissingStatePrompt />
      ) : (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: authColors.background,
  },
});
