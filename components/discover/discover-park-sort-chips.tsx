import { Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: authSpacing.sm,
    paddingVertical: authSpacing.xs,
  },
  chip: {
    paddingHorizontal: authSpacing.md,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: authColors.border,
    backgroundColor: authColors.fieldBackground,
  },
  chipActive: {
    borderColor: authColors.primaryFill,
    backgroundColor: authColors.primaryFill,
  },
  chipPressed: {
    opacity: Platform.OS === 'ios' ? 0.88 : 1,
  },
  chipText: {
    ...authTypography.body,
    color: authColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: authColors.primaryOnFill,
  },
});
