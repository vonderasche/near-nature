import { useCallback, useMemo, useState, type ReactElement } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ExploreSpeciesCard } from '@/components/explore/explore-species-card';
import { ExploreSpeciesDetailModal } from '@/components/explore/explore-species-detail-modal';
import { ExploreSpeciesImageGrid } from '@/components/explore/explore-species-image-grid';
import { InlineFormError } from '@/components/screen/inline-form-error';
import { listSectionSupportingStyles } from '@/components/screen/list-detail-card';
import { authColors, authSpacing } from '@/constants/auth-theme';
import type { GalleryGridColumns } from '@/lib/detections/galleryGridColumns';
import type { ExploreDiscoverLayoutMode } from '@/lib/explore/exploreDiscoverLayout';
import { organizeExploreSpeciesList } from '@/lib/explore/exploreSpeciesSort';
import type { ExploreSpeciesSortMode } from '@/lib/explore/exploreSpeciesSort';
import {
  exploreSpeciesCategoryEmptyLabel,
  exploreSpeciesCategoryLabel,
  type ExploreSpeciesCategory,
} from '@/lib/explore/exploreSpeciesCategory';
import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';
import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';

type SpeciesSection = {
  title: string;
  data: ExploreSpecies[];
};

type Props = {
  category: ExploreSpeciesCategory;
  items: ExploreSpecies[];
  searchQuery: string;
  sortMode: ExploreSpeciesSortMode;
  layoutMode: ExploreDiscoverLayoutMode;
  columnCount: GalleryGridColumns;
  loading: boolean;
  error: string | null;
  refreshControl?: ReactElement<React.ComponentProps<typeof RefreshControl>>;
};

export function ExploreCategoryPage({
  category,
  items,
  searchQuery,
  sortMode,
  layoutMode,
  columnCount,
  loading,
  error,
  refreshControl,
}: Props) {
  const [selected, setSelected] = useState<ExploreSpecies | null>(null);

  const sections = useMemo((): SpeciesSection[] => {
    const { featured, rest } = organizeExploreSpeciesList(items, sortMode);
    const out: SpeciesSection[] = [];
    if (featured.length > 0) {
      out.push({ title: 'Featured', data: featured });
    }
    if (rest.length > 0) {
      out.push({ title: featured.length > 0 ? 'More species' : '', data: rest });
    }
    return out;
  }, [items, sortMode]);

  const renderListItem = useCallback(
    ({ item }: { item: ExploreSpecies }) => (
      <ExploreSpeciesCard species={item} onPress={() => setSelected(item)} />
    ),
    [],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: SpeciesSection }) => {
      if (!section.title) return null;
      return (
        <Text style={[styles.sectionTitle, { color: authColors.textMuted }]}>{section.title}</Text>
      );
    },
    [],
  );

  const openSpecies = useCallback((species: ExploreSpecies) => setSelected(species), []);

  if (error && items.length === 0) {
    return (
      <View style={styles.page}>
        <InlineFormError>{error}</InlineFormError>
      </View>
    );
  }

  if (loading && items.length === 0) {
    return (
      <View
        style={[styles.page, listSectionSupportingStyles.centered]}
        accessibilityLabel={`Loading ${exploreSpeciesCategoryLabel(category)}`}>
        <ActivityIndicator color={authColors.textMuted} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.page}>
        <Text style={listSectionSupportingStyles.muted}>
          {isSearchQueryActive(searchQuery)
            ? `No species match "${searchQuery.trim()}". Try another name or keyword from the description.`
            : `No ${exploreSpeciesCategoryEmptyLabel(category)} listed for this state yet.`}
        </Text>
      </View>
    );
  }

  if (layoutMode === 'grid') {
    return (
      <View style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}>
          {sections.map((section) => (
            <View key={section.title || 'all'}>
              {section.title ? (
                <Text style={[styles.sectionTitle, { color: authColors.textMuted }]}>{section.title}</Text>
              ) : null}
              <ExploreSpeciesImageGrid
                items={section.data}
                columnCount={columnCount}
                borderColor={authColors.border}
                onPress={openSpecies}
              />
            </View>
          ))}
        </ScrollView>
        <ExploreSpeciesDetailModal species={selected} onClose={() => setSelected(null)} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderListItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
      />
      <ExploreSpeciesDetailModal species={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: authSpacing.sm,
    marginBottom: authSpacing.sm,
  },
});
