import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CameraControlButton } from '@/components/camera/camera-control-button';
import { CameraControlGroup } from '@/components/camera/camera-control-group';
import { authSpacing } from '@/constants/auth-theme';
import type { PhotoFlashMode } from '@/lib/camera/photoFlashMode';
import {
  listPreviewModelsForPicker,
  previewModelCaption,
  type PreviewModelId,
} from '@/lib/camera/tflite/preview';
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
  frameProcessorsAvailable: boolean;
  previewMode: PreviewModelId;
  onSelectPreviewModel: (modelId: PreviewModelId) => void;
  onDisableLivePreview: () => void;
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

const PREVIEW_MODELS = listPreviewModelsForPicker();

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
  frameProcessorsAvailable,
  previewMode,
  onSelectPreviewModel,
  onDisableLivePreview,
  onMenuExpandedChange,
}: Props) {
  const [lightingExpanded, setLightingExpanded] = useState(false);
  const [displayExpanded, setDisplayExpanded] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);

  const collapseAll = useCallback(() => {
    setLightingExpanded(false);
    setDisplayExpanded(false);
    setAiExpanded(false);
  }, []);

  useEffect(() => {
    onMenuExpandedChange?.(lightingExpanded || displayExpanded || aiExpanded);
  }, [aiExpanded, displayExpanded, lightingExpanded, onMenuExpandedChange]);

  const showFlash = facing === 'back' || flashSupported;
  const showTorch = facing === 'back';
  const showLightingGroup = showFlash || showTorch;

  const lightingActive = (flashSupported && flashMode !== 'off') || torchOn;
  const displayActive = gridVisible || (hdrSupported && hdrEnabled) || levelEnabled;

  const aiCaption = useMemo(() => {
    if (!frameProcessorsAvailable) return 'AI';
    if (!liveClassifierEnabled) return 'AI';
    return previewModelCaption(previewMode);
  }, [frameProcessorsAvailable, liveClassifierEnabled, previewMode]);

  const toggleLightingExpanded = useCallback(() => {
    hapticToggle();
    setLightingExpanded((open) => {
      if (!open) {
        setDisplayExpanded(false);
        setAiExpanded(false);
      }
      return !open;
    });
  }, []);

  const toggleDisplayExpanded = useCallback(() => {
    hapticToggle();
    setDisplayExpanded((open) => {
      if (!open) {
        setLightingExpanded(false);
        setAiExpanded(false);
      }
      return !open;
    });
  }, []);

  const toggleAiExpanded = useCallback(() => {
    hapticToggle();
    setAiExpanded((open) => {
      if (!open) {
        setLightingExpanded(false);
        setDisplayExpanded(false);
      }
      return !open;
    });
  }, []);

  const handleSelectPreviewModel = useCallback(
    (modelId: PreviewModelId) => {
      onSelectPreviewModel(modelId);
      collapseAll();
    },
    [collapseAll, onSelectPreviewModel],
  );

  const handleDisableLivePreview = useCallback(() => {
    onDisableLivePreview();
    collapseAll();
  }, [collapseAll, onDisableLivePreview]);

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

        <CameraControlGroup
          expanded={aiExpanded}
          onToggleExpanded={toggleAiExpanded}
          onCollapse={collapseAll}
          anchor={
            <CameraControlButton
              icon="sparkles"
              accessibilityLabel={
                frameProcessorsAvailable
                  ? liveClassifierEnabled
                    ? `Live preview: ${previewModelCaption(previewMode)}. Tap to change model.`
                    : 'Live preview off. Tap to choose a model.'
                  : 'Live preview not available in this build'
              }
              onPress={() => {}}
              active={liveClassifierEnabled}
              disabled={!frameProcessorsAvailable}
              caption={aiCaption}
            />
          }>
          <View style={styles.aiFlyoutScroll}>
            <ScrollView
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              bounces={false}
              style={styles.aiFlyoutScrollInner}>
              <CameraControlButton
                icon="x-mark"
                accessibilityLabel="Turn live preview off"
                onPress={handleDisableLivePreview}
                active={!liveClassifierEnabled}
                caption="Off"
              />
              {PREVIEW_MODELS.map((model) => (
                <CameraControlButton
                  key={model.id}
                  icon="eye"
                  accessibilityLabel={`${model.shortName}: ${model.description}`}
                  onPress={() => handleSelectPreviewModel(model.id)}
                  active={liveClassifierEnabled && previewMode === model.id}
                  caption={model.shortName}
                />
              ))}
            </ScrollView>
          </View>
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
    justifyContent: 'center',
    gap: authSpacing.sm,
    overflow: 'visible',
  },
  aiFlyoutScroll: {
    maxHeight: 320,
  },
  aiFlyoutScrollInner: {
    flexGrow: 0,
  },
});
