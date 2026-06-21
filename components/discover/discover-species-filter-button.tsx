import { Pressable, StyleSheet } from 'react-native';

import { discoverSpeciesFilterSummary } from '@/components/discover/discover-species-filter-content';
import { HeroIcon } from '@/components/ui/hero-icon';
import { useDiscoverSpeciesBrowse } from '@/context/DiscoverSpeciesBrowseContext';
import { useTheme } from '@/hooks/useTheme';
import type { DiscoverSpeciesKind } from '@/types/discover-species';

type Props = {
  kind: DiscoverSpeciesKind;
  onPress: () => void;
};

export function DiscoverSpeciesFilterButton({ kind, onPress }: Props) {
  const { theme } = useTheme();
  const { getFilter } = useDiscoverSpeciesBrowse();
  const filter = getFilter(kind);
  const active = filter.kind !== 'all';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Category filter: ${discoverSpeciesFilterSummary(filter)}`}
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
