import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import {
  ANIMAL_SUBCATEGORIES,
  getSpeciesSubcategoryLabel,
  PLANT_SUBCATEGORIES,
  type SpeciesSubcategoryGroup,
  type SpeciesSubcategoryId,
} from '@/constants/species-subcategories';
import { HeroIcon } from '@/components/ui/hero-icon';
import { useTheme } from '@/hooks/useTheme';
import type { GalleryCategoryFilter } from '@/lib/detections/filterDetectionGalleryItems';

type Props = {
  value: GalleryCategoryFilter;
  onChange: (value: GalleryCategoryFilter) => void;
  onDone?: () => void;
};

export function SpeciesSubcategoryFilterContent({ value, onChange, onDone }: Props) {
  const { theme } = useTheme();

  function apply(next: GalleryCategoryFilter) {
    onChange(next);
    onDone?.();
  }

  function selectAll() {
    apply({ kind: 'all' });
  }

  function selectGroup(group: SpeciesSubcategoryGroup) {
    apply({ kind: 'group', group });
  }

  function selectSubcategory(subcategory: SpeciesSubcategoryId) {
    apply({ kind: 'subcategory', subcategory });
  }

  function isSubcategoryActive(id: SpeciesSubcategoryId): boolean {
    return value.kind === 'subcategory' && value.subcategory === id;
  }

  return (
    <ScrollView contentContainerStyle={{ gap: theme.spacing.xs }} keyboardShouldPersistTaps="handled">
      <FilterRow label="All species" active={value.kind === 'all'} onPress={selectAll} />
      <SectionHeader title="Animals" />
      <FilterRow
        label="All animals"
        active={value.kind === 'group' && value.group === 'animal'}
        onPress={() => selectGroup('animal')}
      />
      {ANIMAL_SUBCATEGORIES.map((option) => (
        <FilterRow
          key={option.id}
          label={option.label}
          active={isSubcategoryActive(option.id)}
          onPress={() => selectSubcategory(option.id)}
        />
      ))}
      <SectionHeader title="Plants" />
      <FilterRow
        label="All plants"
        active={value.kind === 'group' && value.group === 'plant'}
        onPress={() => selectGroup('plant')}
      />
      {PLANT_SUBCATEGORIES.map((option) => (
        <FilterRow
          key={option.id}
          label={option.label}
          active={isSubcategoryActive(option.id)}
          onPress={() => selectSubcategory(option.id)}
        />
      ))}
    </ScrollView>
  );
}

export function speciesSubcategoryFilterSummary(value: GalleryCategoryFilter): string {
  if (value.kind === 'all') return 'All species';
  if (value.kind === 'group') return value.group === 'animal' ? 'All animals' : 'All plants';
  return getSpeciesSubcategoryLabel(value.subcategory);
}

function SectionHeader({ title }: { title: string }) {
  const { theme } = useTheme();
  return (
    <Text variant="label" color="secondary" style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.xs }}>
      {title}
    </Text>
  );
}

function FilterRow({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.sm,
          borderRadius: theme.radii.md,
          marginBottom: theme.spacing.xs,
          backgroundColor: active ? theme.colors.surfaceRaised : 'transparent',
        }}>
        <Text variant="body" color={active ? 'primary' : 'secondary'}>
          {label}
        </Text>
        {active ? <HeroIcon name="check" size={20} color={theme.colors.accent} /> : null}
      </View>
    </Pressable>
  );
}
