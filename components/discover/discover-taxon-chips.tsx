import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import {
  EXPLORE_SPECIES_TAXON_FILTERS,
  exploreSpeciesTaxonFilterLabel,
  type ExploreSpeciesTaxonFilter,
} from '@/lib/explore/exploreSpeciesTaxonFilter';

type Props = {
  value: ExploreSpeciesTaxonFilter;
  onChange: (filter: ExploreSpeciesTaxonFilter) => void;
  borderColor: string;
};

export function DiscoverTaxonChips({ value, onChange, borderColor }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist">
      {EXPLORE_SPECIES_TAXON_FILTERS.map((filter) => {
        const active = filter === value;
        return (
          <Pressable
            key={filter}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={exploreSpeciesTaxonFilterLabel(filter)}
            onPress={() => onChange(filter)}
            style={({ pressed }) => [
              styles.chip,
              { borderColor },
              active && styles.chipActive,
              pressed && !active && styles.chipPressed,
            ]}>
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
              {exploreSpeciesTaxonFilterLabel(filter).toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: authSpacing.xs,
    paddingVertical: authSpacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 0,
    paddingHorizontal: authSpacing.md,
    paddingVertical: authSpacing.xs,
    backgroundColor: authColors.background,
  },
  chipActive: {
    backgroundColor: authColors.text,
    borderColor: authColors.text,
  },
  chipPressed: {
    opacity: 0.88,
  },
  chipLabel: {
    ...authTypography.label,
    fontSize: 12,
    color: authColors.textMuted,
  },
  chipLabelActive: {
    color: authColors.background,
  },
});
