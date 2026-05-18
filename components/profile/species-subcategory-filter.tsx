import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { SheetModalShell, sheetModalShellStyles } from '@/components/ui/sheet-modal-shell';
import {
  ANIMAL_SUBCATEGORIES,
  getSpeciesSubcategoryLabel,
  PLANT_SUBCATEGORIES,
  type SpeciesSubcategoryGroup,
  type SpeciesSubcategoryId,
} from '@/constants/species-subcategories';
import { HeroIcon } from '@/components/ui/hero-icon';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { GalleryCategoryFilter } from '@/lib/detections/filterDetectionGalleryItems';

type SpeciesSubcategoryFilterProps = {
  visible: boolean;
  value: GalleryCategoryFilter;
  onChange: (value: GalleryCategoryFilter) => void;
  onClose: () => void;
};

function filterLabel(value: GalleryCategoryFilter): string {
  if (value.kind === 'all') return 'All species';
  if (value.kind === 'group') return value.group === 'animal' ? 'All animals' : 'All plants';
  return getSpeciesSubcategoryLabel(value.subcategory);
}

export function speciesSubcategoryFilterSummary(value: GalleryCategoryFilter): string {
  return filterLabel(value);
}

export function SpeciesSubcategoryFilterModal({
  visible,
  value,
  onChange,
  onClose,
}: SpeciesSubcategoryFilterProps) {
  function selectAll() {
    onChange({ kind: 'all' });
    onClose();
  }

  function selectGroup(group: SpeciesSubcategoryGroup) {
    onChange({ kind: 'group', group });
    onClose();
  }

  function selectSubcategory(subcategory: SpeciesSubcategoryId) {
    onChange({ kind: 'subcategory', subcategory });
    onClose();
  }

  function isSubcategoryActive(id: SpeciesSubcategoryId): boolean {
    return value.kind === 'subcategory' && value.subcategory === id;
  }

  return (
    <SheetModalShell visible={visible} onRequestClose={onClose} onBackdropPress={onClose}>
      <Text style={sheetModalShellStyles.sheetTitle}>Filter by category</Text>
      <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
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
    </SheetModalShell>
  );
}

type SpeciesSubcategoryFilterButtonProps = {
  value: GalleryCategoryFilter;
  onPress: () => void;
  mutedColor: string;
  borderColor: string;
};

export function SpeciesSubcategoryFilterButton({
  value,
  onPress,
  mutedColor,
  borderColor,
}: SpeciesSubcategoryFilterButtonProps) {
  const active = value.kind !== 'all';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Category filter: ${filterLabel(value)}`}
      onPress={onPress}
      style={[styles.button, { borderColor }, active && styles.buttonActive]}>
      <HeroIcon name="funnel" size={18} color={active ? authColors.text : mutedColor} />
      <Text style={[styles.buttonText, { color: active ? authColors.text : mutedColor }]} numberOfLines={1}>
        {filterLabel(value)}
      </Text>
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.row, active && styles.rowActive]}>
      <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>{label}</Text>
      {active ? <HeroIcon name="check" size={20} color={authColors.text} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {
    maxHeight: 420,
    marginBottom: authSpacing.sm,
  },
  sectionHeader: {
    ...authTypography.label,
    color: authColors.textMuted,
    marginTop: authSpacing.md,
    marginBottom: authSpacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: authSpacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: authColors.border,
  },
  rowActive: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowLabel: {
    ...authTypography.body,
    color: authColors.textMuted,
    flex: 1,
  },
  rowLabelActive: {
    color: authColors.text,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.xs,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: authSpacing.sm,
    paddingVertical: authSpacing.xs,
    maxWidth: 200,
  },
  buttonActive: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  buttonText: {
    ...authTypography.subtitle,
    flexShrink: 1,
  },
});
