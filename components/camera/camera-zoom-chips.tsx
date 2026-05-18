import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { cameraZoomChipsBottomOffset } from '@/constants/camera-layout';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { ZoomChip } from '@/lib/camera/cameraZoom';

type Props = {
  chips: ZoomChip[];
  activeChipId: string | null;
  onSelectChip: (chip: ZoomChip) => void;
  bottomInset: number;
};

export function CameraZoomChips({ chips, activeChipId, onSelectChip, bottomInset }: Props) {
  if (chips.length === 0) return null;

  return (
    <View style={[styles.bar, { bottom: cameraZoomChipsBottomOffset(bottomInset) }]} pointerEvents="box-none">
      <View style={styles.row}>
        {chips.map((chip) => {
          const active = chip.id === activeChipId;
          return (
            <Pressable
              key={chip.id}
              accessibilityRole="button"
              accessibilityLabel={`Zoom ${chip.label}`}
              accessibilityState={{ selected: active }}
              onPress={() => onSelectChip(chip)}
              android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                pressed && styles.chipPressed,
              ]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
  row: {
    flexDirection: 'row',
    gap: authSpacing.sm,
    paddingHorizontal: authSpacing.md,
    paddingVertical: authSpacing.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  chip: {
    minWidth: 44,
    paddingHorizontal: authSpacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: authColors.primaryFill,
  },
  chipPressed: {
    opacity: Platform.OS === 'ios' ? 0.88 : 1,
  },
  chipText: {
    ...authTypography.body,
    color: authColors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: authColors.primaryOnFill,
  },
});
