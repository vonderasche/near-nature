import { Pressable, StyleSheet } from 'react-native';

import { speciesSubcategoryFilterSummary } from '@/components/profile/species-subcategory-filter-content';
import { HeroIcon } from '@/components/ui/hero-icon';
import { useTheme } from '@/hooks/useTheme';
import type { GalleryCategoryFilter } from '@/lib/detections/filterDetectionGalleryItems';

export { speciesSubcategoryFilterSummary };

type SpeciesSubcategoryFilterButtonProps = {
  value: GalleryCategoryFilter;
  onPress: () => void;
};

export function SpeciesSubcategoryFilterButton({ value, onPress }: SpeciesSubcategoryFilterButtonProps) {
  const { theme } = useTheme();
  const active = value.kind !== 'all';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Category filter: ${speciesSubcategoryFilterSummary(value)}`}
      accessibilityHint="Opens category filter"
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [styles.iconTrigger, { padding: theme.spacing.xs }, pressed && styles.iconTriggerPressed]}>
      <HeroIcon
        name="funnel"
        size={22}
        color={active ? theme.colors.textPrimary : theme.colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconTrigger: {},
  iconTriggerPressed: {
    opacity: 0.75,
  },
});
