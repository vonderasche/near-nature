import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import {
  discoverSubcategoriesForKind,
  getDiscoverSubcategoryLabel,
  type DiscoverSpeciesSubcategoryId,
} from '@/lib/discover/discoverSpeciesSubcategories';
import type { DiscoverSpeciesSubcategoryFilter } from '@/lib/discover/discoverSpeciesFilter';
import type { DiscoverSpeciesEntry, DiscoverSpeciesKind } from '@/types/discover-species';

type Props = {
  kind: DiscoverSpeciesKind;
  entries: readonly DiscoverSpeciesEntry[];
  filter: DiscoverSpeciesSubcategoryFilter;
  onFilterChange: (filter: DiscoverSpeciesSubcategoryFilter) => void;
};

export function DiscoverSpeciesSubcategoryChips({ kind, entries, filter, onFilterChange }: Props) {
  const { theme } = useTheme();

  const availableSubcategories = useMemo(() => {
    const counts = new Map<DiscoverSpeciesSubcategoryId, number>();
    for (const entry of entries) {
      counts.set(entry.subcategoryId, (counts.get(entry.subcategoryId) ?? 0) + 1);
    }
    return discoverSubcategoriesForKind(kind).filter((option) => (counts.get(option.id) ?? 0) > 0);
  }, [entries, kind]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          gap: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
        },
        chip: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: 8,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.fieldBackground,
        },
        chipActive: {
          borderColor: theme.colors.primaryFill,
          backgroundColor: theme.colors.primaryFill,
        },
        chipPressed: {
          opacity: Platform.OS === 'ios' ? 0.88 : 1,
        },
        chipText: {
          ...theme.typography.body,
          color: theme.colors.textSecondary,
          fontSize: 13,
          fontWeight: '600',
        },
        chipTextActive: {
          color: theme.colors.primaryOnFill,
        },
      }),
    [theme],
  );

  if (availableSubcategories.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
      accessibilityLabel="Species categories">
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: filter.kind === 'all' }}
        onPress={() => onFilterChange({ kind: 'all' })}
        style={({ pressed }) => [
          styles.chip,
          filter.kind === 'all' && styles.chipActive,
          pressed && styles.chipPressed,
        ]}>
        <Text style={[styles.chipText, filter.kind === 'all' && styles.chipTextActive]}>All</Text>
      </Pressable>
      {availableSubcategories.map((option) => {
        const active = filter.kind === 'subcategory' && filter.subcategory === option.id;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={getDiscoverSubcategoryLabel(option.id)}
            onPress={() => onFilterChange({ kind: 'subcategory', subcategory: option.id })}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && styles.chipPressed,
            ]}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
