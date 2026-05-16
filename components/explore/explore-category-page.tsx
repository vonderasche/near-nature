import { useCallback, useState, type ReactElement } from 'react';
import {
  ActivityIndicator,
  FlatList,
  type RefreshControlProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ExploreSpeciesCard } from '@/components/explore/explore-species-card';
import { ExploreSpeciesDetailModal } from '@/components/explore/explore-species-detail-modal';
import { InlineFormError } from '@/components/screen/inline-form-error';
import { listSectionSupportingStyles } from '@/components/screen/list-detail-card';
import { authColors } from '@/constants/auth-theme';
import { exploreTypeLabel, type ExploreSpecies, type ExploreSpeciesType } from '@/lib/explore/exploreSpeciesTypes';

type Props = {
  type: ExploreSpeciesType;
  items: ExploreSpecies[];
  loading: boolean;
  error: string | null;
  pageWidth: number;
  refreshControl?: ReactElement<RefreshControlProps>;
};

export function ExploreCategoryPage({
  type,
  items,
  loading,
  error,
  pageWidth,
  refreshControl,
}: Props) {
  const [selected, setSelected] = useState<ExploreSpecies | null>(null);

  const renderItem = useCallback(
    ({ item }: { item: ExploreSpecies }) => (
      <ExploreSpeciesCard species={item} onPress={() => setSelected(item)} />
    ),
    [],
  );

  if (error && items.length === 0) {
    return (
      <View style={[styles.page, { width: pageWidth }]}>
        <InlineFormError>{error}</InlineFormError>
      </View>
    );
  }

  if (loading && items.length === 0) {
    return (
      <View
        style={[styles.page, listSectionSupportingStyles.centered, { width: pageWidth }]}
        accessibilityLabel={`Loading ${type}`}>
        <ActivityIndicator color={authColors.textMuted} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={[styles.page, { width: pageWidth }]}>
        <Text style={listSectionSupportingStyles.muted}>
          No {exploreTypeLabel(type).toLowerCase()} listed for this state yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.page, { width: pageWidth }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
});
