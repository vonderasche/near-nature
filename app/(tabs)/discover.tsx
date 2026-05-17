import { useCallback, useState } from 'react';

import type { ExploreSpeciesCategory } from '@/lib/explore/exploreSpeciesCategory';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiscoverMissingStatePrompt } from '@/components/discover/discover-missing-state-prompt';
import { ExploreSpeciesPager } from '@/components/explore/explore-species-pager';
import { ScreenSearchField } from '@/components/ui/screen-search-field';
import { CenteredActivityIndicator } from '@/components/profile/centered-activity-indicator';
import { ScreenHeading } from '@/components/screen/screen-heading';
import { authColors, authSpacing } from '@/constants/auth-theme';
import { useExploreDiscoverLayout } from '@/hooks/useExploreDiscoverLayout';
import { useExploreSpecies } from '@/hooks/useExploreSpecies';
import { useExploreSpeciesCategory } from '@/hooks/useExploreSpeciesCategory';
import { useExploreSpeciesSort } from '@/hooks/useExploreSpeciesSort';
import { useGalleryGridColumns } from '@/hooks/useGalleryGridColumns';
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
  const { sortMode, setSort } = useExploreSpeciesSort();
  const { category, setCategory } = useExploreSpeciesCategory();
  const { layoutMode, setLayout } = useExploreDiscoverLayout();
  const { columns, setColumnCount } = useGalleryGridColumns();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onCategoryChange = useCallback(
    (next: ExploreSpeciesCategory) => {
      setCategory(next);
      if (next === 'all') setSort('observations');
    },
    [setCategory, setSort],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const subtitle = hasHomeState
    ? `Popular species in ${stateName}. Choose All species to mix animals and plants by observations.`
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
        <View style={styles.content}>
          <ScreenSearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search common or scientific name, description…"
            accessibilityLabel="Search species"
          />
          <ExploreSpeciesPager
            byType={byType}
            searchQuery={searchQuery}
            category={category}
          onCategoryChange={onCategoryChange}
          sortMode={sortMode}
          onSortChange={setSort}
          layoutMode={layoutMode}
          onLayoutChange={setLayout}
          columnCount={columns}
          onColumnCountChange={setColumnCount}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  content: {
    flex: 1,
  },
});
