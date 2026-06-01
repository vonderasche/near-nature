import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CameraControlButton } from '@/components/camera/camera-control-button';
import { CameraControlGroup } from '@/components/camera/camera-control-group';
import { authSpacing } from '@/constants/auth-theme';
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
  liveClassifierEnabled: boolean;
  onLiveClassifierPress: () => void;
  onMenuExpandedChange?: (expanded: boolean) => void;
};

function toggleCaption(on: boolean): string {
  return on ? 'On' : 'Off';
}

function hapticToggle() {
  try {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    /* haptics unavailable */
  }
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
  liveClassifierEnabled,
  onLiveClassifierPress,
  onMenuExpandedChange,
}: Props) {
  const [lightingExpanded, setLightingExpanded] = useState(false);
  const [displayExpanded, setDisplayExpanded] = useState(false);

  const collapseAll = useCallback(() => {
    setLightingExpanded(false);
    setDisplayExpanded(false);
  }, []);

  useEffect(() => {
    onMenuExpandedChange?.(lightingExpanded || displayExpanded);
  }, [displayExpanded, lightingExpanded, onMenuExpandedChange]);

  const showFlash = facing === 'back' || flashSupported;
  const showTorch = facing === 'back';
  const showLightingGroup = showFlash || showTorch;

  const lightingActive = (flashSupported && flashMode !== 'off') || torchOn;
  const displayActive = gridVisible || (hdrSupported && hdrEnabled) || levelEnabled;

  const toggleLightingExpanded = useCallback(() => {
    hapticToggle();
    setLightingExpanded((open) => {
      if (!open) setDisplayExpanded(false);
      return !open;
    });
  }, []);

  const toggleDisplayExpanded = useCallback(() => {
    hapticToggle();
    setDisplayExpanded((open) => {
      if (!open) setLightingExpanded(false);
      return !open;
    });
  }, []);

  return (
    <View style={[styles.bar, { paddingTop: insets.top + authSpacing.sm }]} pointerEvents="box-none">
      <View style={styles.controlsRow}>
        {showLightingGroup ? (
          <CameraControlGroup
            expanded={lightingExpanded}
            onToggleExpanded={toggleLightingExpanded}
            onCollapse={collapseAll}
            anchor={
              <CameraControlButton
                icon={showFlash ? photoFlashIconName(flashMode) : 'light-bulb'}
                accessibilityLabel="Lighting controls"
                onPress={() => {}}
                active={lightingActive}
                caption="Light"
              />
            }>
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
          </CameraControlGroup>
        ) : null}

        <CameraControlGroup
          expanded={displayExpanded}
          onToggleExpanded={toggleDisplayExpanded}
          onCollapse={collapseAll}
          anchor={
            <CameraControlButton
              icon="squares-2x2"
              accessibilityLabel="Display overlays"
              onPress={() => {}}
              active={displayActive}
              caption="View"
            />
          }>
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
            icon="bars-3"
            accessibilityLabel={levelEnabled ? 'Hide level' : 'Show horizon level'}
            onPress={onLevelPress}
            active={levelEnabled}
            caption={`Level ${toggleCaption(levelEnabled)}`}
          />
        </CameraControlGroup>

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
          icon="sparkles"
          accessibilityLabel={
            liveClassifierEnabled ? 'Turn live classifier off' : 'Turn live classifier on'
          }
          onPress={onLiveClassifierPress}
          active={liveClassifierEnabled}
          caption={`AI ${toggleCaption(liveClassifierEnabled)}`}
        />
      </View>
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
    overflow: 'visible',
  },
  controlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: authSpacing.sm,
    overflow: 'visible',
  },
});
