import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { cameraControlColors, cameraZoomChipsBottomOffset } from '@/constants/camera-layout';
import { useTheme } from '@/hooks/useTheme';
import type { ZoomChip } from '@/lib/camera/cameraZoom';

type Props = {
  chips: ZoomChip[];
  activeChipId: string | null;
  onSelectChip: (chip: ZoomChip) => void;
  bottomInset: number;
};

export function CameraZoomChips({ chips, activeChipId, onSelectChip, bottomInset }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          gap: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          borderRadius: 20,
          backgroundColor: 'rgba(0,0,0,0.45)',
        },
        chip: {
          minWidth: 44,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 6,
          borderRadius: 16,
          alignItems: 'center',
        },
        chipActive: {
          backgroundColor: '#ffffff',
        },
        chipPressed: {
          opacity: Platform.OS === 'ios' ? 0.88 : 1,
        },
        chipText: {
          ...theme.typography.body,
          color: '#ffffff',
          fontSize: 14,
          fontWeight: '600',
        },
        chipTextActive: {
          color: cameraControlColors.label,
        },
      }),
    [theme],
  );

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
