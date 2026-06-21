import { Pressable, StyleSheet } from 'react-native';

import { speciesSubcategoryFilterSummary } from '@/components/profile/species-subcategory-filter-content';
import { HeroIcon } from '@/components/ui/hero-icon';
import { authColors, authSpacing } from '@/constants/auth-theme';
import type { GalleryCategoryFilter } from '@/lib/detections/filterDetectionGalleryItems';

export { speciesSubcategoryFilterSummary };

type SpeciesSubcategoryFilterButtonProps = {
  value: GalleryCategoryFilter;
  onPress: () => void;
};

export function SpeciesSubcategoryFilterButton({ value, onPress }: SpeciesSubcategoryFilterButtonProps) {
  const active = value.kind !== 'all';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Category filter: ${speciesSubcategoryFilterSummary(value)}`}
      accessibilityHint="Opens category filter"
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [styles.iconTrigger, pressed && styles.iconTriggerPressed]}>
      <HeroIcon name="funnel" size={22} color={active ? authColors.text : authColors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconTrigger: {
    padding: authSpacing.xs,
  },
  iconTriggerPressed: {
    opacity: 0.75,
  },
});
