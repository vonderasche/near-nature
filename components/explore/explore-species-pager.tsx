import { useCallback, useRef, useState, type ReactElement } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type RefreshControlProps,
  StyleSheet,
  View,
} from 'react-native';

import { ExploreCategoryPage } from '@/components/explore/explore-category-page';
import { ExploreTypeTabs } from '@/components/explore/explore-type-tabs';
import type { ExploreSpeciesByType } from '@/hooks/useExploreSpecies';
import {
  EXPLORE_SPECIES_TYPES,
  type ExploreSpeciesType,
} from '@/lib/explore/exploreSpeciesTypes';

type Props = {
  byType: ExploreSpeciesByType;
  loading: boolean;
  error: string | null;
  refreshControl?: ReactElement<RefreshControlProps>;
};

export function ExploreSpeciesPager({
  byType,
  loading,
  error,
  refreshControl,
}: Props) {
  const horizontalRef = useRef<FlatList<ExploreSpeciesType>>(null);
  const [activeType, setActiveType] = useState<ExploreSpeciesType>('animals');
  const [pageWidth, setPageWidth] = useState(0);

  const onTabSelect = useCallback((type: ExploreSpeciesType) => {
    const index = EXPLORE_SPECIES_TYPES.indexOf(type);
    if (index < 0) return;
    setActiveType(type);
    if (pageWidth > 0) {
      horizontalRef.current?.scrollToOffset({ offset: index * pageWidth, animated: true });
    }
  }, [pageWidth]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageWidth <= 0) return;
      const index = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
      const type = EXPLORE_SPECIES_TYPES[index];
      if (type) setActiveType(type);
    },
    [pageWidth],
  );

  const renderPage = useCallback(
    ({ item: type }: { item: ExploreSpeciesType }) => (
      <ExploreCategoryPage
        type={type}
        items={byType[type]}
        loading={loading}
        error={error}
        pageWidth={pageWidth}
        refreshControl={refreshControl}
      />
    ),
    [byType, loading, error, pageWidth, refreshControl],
  );

  return (
    <View
      style={styles.fill}
      onLayout={(e) => {
        const w = Math.round(e.nativeEvent.layout.width);
        if (w > 0 && w !== pageWidth) setPageWidth(w);
      }}>
      <ExploreTypeTabs active={activeType} onSelect={onTabSelect} />
      {pageWidth > 0 ? (
        <FlatList
          ref={horizontalRef}
          data={EXPLORE_SPECIES_TYPES}
          keyExtractor={(t) => t}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          bounces={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          getItemLayout={(_, index) => ({ length: pageWidth, offset: pageWidth * index, index })}
          renderItem={renderPage}
          style={styles.fill}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    minHeight: 320,
  },
});
