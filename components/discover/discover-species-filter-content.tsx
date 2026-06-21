import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { HeroIcon } from '@/components/ui/hero-icon';
import { useTheme } from '@/hooks/useTheme';
import {
  discoverSubcategoriesForKind,
  getDiscoverSubcategoryLabel,
} from '@/lib/discover/discoverSpeciesSubcategories';
import type { DiscoverSpeciesSubcategoryFilter } from '@/lib/discover/discoverSpeciesFilter';
import type { DiscoverSpeciesKind } from '@/types/discover-species';

type Props = {
  kind: DiscoverSpeciesKind;
  value: DiscoverSpeciesSubcategoryFilter;
  onChange: (value: DiscoverSpeciesSubcategoryFilter) => void;
  onDone?: () => void;
};

export function discoverSpeciesFilterSummary(value: DiscoverSpeciesSubcategoryFilter): string {
  if (value.kind === 'all') return 'All categories';
  return getDiscoverSubcategoryLabel(value.subcategory);
}

export function DiscoverSpeciesFilterContent({ kind, value, onChange, onDone }: Props) {
  const { theme } = useTheme();
  const options = discoverSubcategoriesForKind(kind);
  const kindLabel = kind === 'plant' ? 'plants' : 'animals';

  function apply(next: DiscoverSpeciesSubcategoryFilter) {
    onChange(next);
    onDone?.();
  }

  return (
    <ScrollView contentContainerStyle={{ gap: theme.spacing.xs }} keyboardShouldPersistTaps="handled">
      <FilterRow
        label={`All ${kindLabel}`}
        active={value.kind === 'all'}
        onPress={() => apply({ kind: 'all' })}
      />
      {options.map((option) => (
        <FilterRow
          key={option.id}
          label={option.label}
          active={value.kind === 'subcategory' && value.subcategory === option.id}
          onPress={() => apply({ kind: 'subcategory', subcategory: option.id })}
        />
      ))}
    </ScrollView>
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
