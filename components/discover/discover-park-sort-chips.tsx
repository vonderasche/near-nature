import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import {
  DISCOVER_PARK_SORT_OPTIONS,
  discoverParkSortLabel,
  type DiscoverParkSortMode,
} from '@/lib/parks/discoverParkSort';

type Props = {
  value: DiscoverParkSortMode;
  onChange: (mode: DiscoverParkSortMode) => void;
};

export function DiscoverParkSortChips({ value, onChange }: Props) {
  const { theme } = useTheme();
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
          fontSize: 14,
          fontWeight: '600',
        },
        chipTextActive: {
          color: theme.colors.primaryOnFill,
        },
      }),
    [theme],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
      accessibilityLabel="Sort parks">
      {DISCOVER_PARK_SORT_OPTIONS.map((mode) => {
        const active = mode === value;
        return (
          <Pressable
            key={mode}
            accessibilityRole="tab"
            accessibilityLabel={`Sort by ${discoverParkSortLabel(mode)}`}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(mode)}
            android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && styles.chipPressed,
            ]}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {discoverParkSortLabel(mode)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
