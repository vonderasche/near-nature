import { StyleSheet, Text, View } from 'react-native';

import { CameraControlButton } from '@/components/camera/camera-control-button';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { PhotoFlashMode } from '@/lib/camera/photoFlashMode';
import { photoFlashAccessibilityLabel, photoFlashIconName } from '@/lib/camera/photoFlashMode';

type Insets = { top: number };

type Props = {
  insets: Insets;
  flashMode: PhotoFlashMode;
  onFlashPress: () => void;
  hasFlash: boolean;
  torchOn: boolean;
  onTorchPress: () => void;
  hasTorch: boolean;
};

export function CameraTopControls({
  insets,
  flashMode,
  onFlashPress,
  hasFlash,
  torchOn,
  onTorchPress,
  hasTorch,
}: Props) {
  return (
    <View style={[styles.bar, { paddingTop: insets.top + authSpacing.sm }]}>
      <View style={styles.row}>
        {hasFlash ? (
          <CameraControlButton
            icon={photoFlashIconName(flashMode)}
            accessibilityLabel={photoFlashAccessibilityLabel(flashMode)}
            onPress={onFlashPress}
            active={flashMode === 'on'}
          />
        ) : null}
        {hasTorch ? (
          <CameraControlButton
            icon={torchOn ? 'flashlight-on' : 'flashlight-off'}
            accessibilityLabel={torchOn ? 'Torch on' : 'Torch off'}
            onPress={onTorchPress}
            active={torchOn}
          />
        ) : null}
      </View>
      <Text style={styles.hint} accessibilityRole="text">
        Pinch to zoom · Tap to focus
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: authSpacing.md,
    gap: authSpacing.xs,
    zIndex: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.sm,
  },
  hint: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    fontSize: 12,
    marginLeft: authSpacing.xs,
  },
});
