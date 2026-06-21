import { Pressable, StyleSheet } from 'react-native';

import { discoverSpeciesFilterSummary } from '@/components/discover/discover-species-filter-content';
import { HeroIcon } from '@/components/ui/hero-icon';
import { useTheme } from '@/hooks/useTheme';
import type { DiscoverSpeciesSubcategoryFilter } from '@/lib/discover/discoverSpeciesFilter';

type Props = {
  value: DiscoverSpeciesSubcategoryFilter;
  onPress: () => void;
};

export function DiscoverSpeciesFilterButton({ value, onPress }: Props) {
  const { theme } = useTheme();
  const active = value.kind !== 'all';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Category filter: ${discoverSpeciesFilterSummary(value)}`}
      accessibilityHint="Opens category filter"
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [styles.trigger, { padding: theme.spacing.xs }, pressed && styles.triggerPressed]}>
      <HeroIcon
        name="funnel"
        size={22}
        color={active ? theme.colors.textPrimary : theme.colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {},
  triggerPressed: {
    opacity: 0.75,
  },
});
