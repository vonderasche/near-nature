import { Pressable, StyleSheet } from 'react-native';

import { discoverSpeciesFilterSummary } from '@/components/discover/discover-species-filter-content';
import { HeroIcon } from '@/components/ui/hero-icon';
import { authColors, authSpacing } from '@/constants/auth-theme';
import type { DiscoverSpeciesSubcategoryFilter } from '@/lib/discover/discoverSpeciesFilter';

type Props = {
  value: DiscoverSpeciesSubcategoryFilter;
  onPress: () => void;
};

export function DiscoverSpeciesFilterButton({ value, onPress }: Props) {
  const active = value.kind !== 'all';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Category filter: ${discoverSpeciesFilterSummary(value)}`}
      accessibilityHint="Opens category filter"
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}>
      <HeroIcon name="funnel" size={22} color={active ? authColors.text : authColors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    padding: authSpacing.xs,
  },
  triggerPressed: {
    opacity: 0.75,
  },
});
