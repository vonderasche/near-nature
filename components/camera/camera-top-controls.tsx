import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CameraControlButton } from '@/components/camera/camera-control-button';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { PhotoFlashMode } from '@/lib/camera/photoFlashMode';
import {
  photoFlashAccessibilityLabel,
  photoFlashCaption,
  photoFlashIconName,
} from '@/lib/camera/photoFlashMode';

type Insets = { top: number };

type Props = {
  insets: Insets;
  facing: 'back' | 'front';
  flashMode: PhotoFlashMode;
  onFlashPress: () => void;
  flashSupported: boolean;
  torchOn: boolean;
  onTorchPress: () => void;
  torchSupported: boolean;
  gridVisible: boolean;
  onGridPress: () => void;
  hdrEnabled: boolean;
  onHdrPress: () => void;
  hdrSupported: boolean;
  stabilizationEnabled: boolean;
  onStabilizationPress: () => void;
  stabilizationSupported: boolean;
  shutterSoundEnabled: boolean;
  onShutterSoundPress: () => void;
  levelEnabled: boolean;
  onLevelPress: () => void;
};

function toggleCaption(on: boolean): string {
  return on ? 'On' : 'Off';
}

export function CameraTopControls({
  insets,
  facing,
  flashMode,
  onFlashPress,
  flashSupported,
  torchOn,
  onTorchPress,
  torchSupported,
  gridVisible,
  onGridPress,
  hdrEnabled,
  onHdrPress,
  hdrSupported,
  stabilizationEnabled,
  onStabilizationPress,
  stabilizationSupported,
  shutterSoundEnabled,
  onShutterSoundPress,
  levelEnabled,
  onLevelPress,
}: Props) {
  const showFlash = facing === 'back' || flashSupported;
  const showTorch = facing === 'back';

  return (
    <View style={[styles.bar, { paddingTop: insets.top + authSpacing.sm }]}>
      <Text style={styles.hint} accessibilityRole="text">
        Pinch to zoom · Tap to focus · 1× 2× 5× below
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.controlsScroll}
        style={styles.controlsViewport}>
        {showFlash ? (
          <CameraControlButton
            icon={photoFlashIconName(flashMode)}
            accessibilityLabel={
              flashSupported
                ? photoFlashAccessibilityLabel(flashMode)
                : 'Flash not available on this camera'
            }
            onPress={onFlashPress}
            active={flashMode !== 'off'}
            disabled={!flashSupported}
            caption={photoFlashCaption(flashMode)}
          />
        ) : null}
        {showTorch ? (
          <CameraControlButton
            icon="light-bulb"
            accessibilityLabel={
              torchSupported
                ? torchOn
                  ? 'Torch on'
                  : 'Torch off'
                : 'Torch not available on this camera'
            }
            onPress={onTorchPress}
            active={torchOn}
            disabled={!torchSupported}
            caption={toggleCaption(torchOn)}
          />
        ) : null}
        <CameraControlButton
          icon="squares-2x2"
          accessibilityLabel={gridVisible ? 'Hide grid' : 'Show grid'}
          onPress={onGridPress}
          active={gridVisible}
          caption="Grid"
        />
        <CameraControlButton
          icon="sparkles"
          accessibilityLabel={hdrSupported ? 'Toggle HDR' : 'HDR not available on this camera'}
          onPress={onHdrPress}
          active={hdrEnabled && hdrSupported}
          disabled={!hdrSupported}
          caption={`HDR ${hdrEnabled ? 'On' : 'Off'}`}
        />
        <CameraControlButton
          icon="arrow-path"
          accessibilityLabel={
            stabilizationSupported ? 'Toggle stabilization' : 'Stabilization not available'
          }
          onPress={onStabilizationPress}
          active={stabilizationEnabled && stabilizationSupported}
          disabled={!stabilizationSupported}
          caption={`Stab ${toggleCaption(stabilizationEnabled)}`}
        />
        <CameraControlButton
          icon={shutterSoundEnabled ? 'speaker-wave' : 'speaker-x-mark'}
          accessibilityLabel={shutterSoundEnabled ? 'Mute shutter sound' : 'Enable shutter sound'}
          onPress={onShutterSoundPress}
          active={shutterSoundEnabled}
          caption={`Sound ${toggleCaption(shutterSoundEnabled)}`}
        />
        <CameraControlButton
          icon="bars-3"
          accessibilityLabel={levelEnabled ? 'Hide level' : 'Show horizon level'}
          onPress={onLevelPress}
          active={levelEnabled}
          caption={`Level ${toggleCaption(levelEnabled)}`}
        />
      </ScrollView>
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
    zIndex: 15,
    elevation: 15,
    gap: authSpacing.xs,
  },
  hint: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    fontSize: 12,
  },
  controlsViewport: {
    flexGrow: 0,
  },
  controlsScroll: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: authSpacing.xs,
    paddingRight: authSpacing.md,
  },
});
