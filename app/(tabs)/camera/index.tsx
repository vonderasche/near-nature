import { Redirect, usePathname, useRouter, type Href } from 'expo-router';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthContext } from '@/context/AuthContext';
import { routeCameraIdentification, routes } from '@/lib/routing/routes';

import { AuthButton } from '@/components/auth/auth-button';
import { CameraBottomToolbar } from '@/components/camera/camera-bottom-toolbar';
import { CameraLivePreviewWithClassifier } from '@/components/camera/camera-live-preview-with-classifier';
import { CameraTopControls } from '@/components/camera/camera-top-controls';
import { CameraZoomChips } from '@/components/camera/camera-zoom-chips';
import { useCameraCaptureFormat } from '@/hooks/useCameraCaptureFormat';
import { useCameraPreviewDebugSession } from '@/hooks/useCameraPreviewDebugSession';
import { useCameraPreferences } from '@/hooks/useCameraPreferences';
import { useCameraZoom } from '@/hooks/useCameraZoom';
import { useMvpCaptureSessionActive } from '@/hooks/useMvpCaptureSessionActive';
import { useMvpLivePreviewSuspended } from '@/hooks/useMvpLivePreviewSuspended';
import { CenteredActivityIndicator } from '@/components/shared/centered-activity-indicator';
import { ScreenCenter } from '@/components/shared/screen-center';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { useTheme } from '@/hooks/useTheme';
import { useCameraScreen } from '@/hooks/useCameraScreen';
import { usePickPhotoFromGallery } from '@/hooks/usePickPhotoFromGallery';
import { areFrameProcessorsAvailable } from '@/lib/camera/areFrameProcessorsAvailable';
import { isClassificationDebugEnabled } from '@/lib/classification/debug';
import { isMvpCaptureEnabled } from '@/lib/camera/tflite/mvp/isMvpCaptureEnabled';
import {
  beginMvpCaptureSession,
  ensureMvpPreviewResumableOnCameraFocus,
  resumeCameraHardwarePreview,
} from '@/lib/camera/tflite/mvp/mvpTfliteMemory';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';
import { RegionComingSoon } from '@/components/shared/region-coming-soon';
import { useActiveRegion } from '@/context/RegionContext';

export default function CameraScreen() {
  const { theme } = useTheme();
  const { isLive } = useActiveRegion();
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [pickerNotice, setPickerNotice] = useState<{ title: string; message: string } | null>(null);
  const [controlMenusOpen, setControlMenusOpen] = useState(false);

  useCameraPreviewDebugSession(isClassificationDebugEnabled());

  const navigateToIdentification = useCallback(
    (uri: string) => {
      if (isMvpCaptureEnabled()) {
        beginMvpCaptureSession();
      }
      router.push(routeCameraIdentification({ uri }) as unknown as Href);
    },
    [router],
  );

  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      if (!isMvpCaptureEnabled()) return;
      resumeCameraHardwarePreview();
      const timer = setTimeout(() => {
        if (!pathname.includes('/camera/identification')) {
          ensureMvpPreviewResumableOnCameraFocus();
        }
      }, 150);
      return () => clearTimeout(timer);
    }, [pathname]),
  );

  const onPhotoCaptured = useCallback(
    (uri: string) => {
      navigateToIdentification(uri);
    },
    [navigateToIdentification],
  );

  const { pickFromGallery, picking: pickingGallery } = usePickPhotoFromGallery();

  const handlePickGallery = useCallback(async () => {
    const result = await pickFromGallery();
    if (result.ok) {
      navigateToIdentification(result.uri);
      return;
    }
    if (result.reason === 'permission' || result.reason === 'error') {
      setPickerNotice({
        title: result.reason === 'permission' ? 'Photos access' : 'Gallery',
        message: result.message,
      });
    }
  }, [navigateToIdentification, pickFromGallery]);

  const {
    hdrEnabled,
    toggleHdr,
    stabilizationEnabled,
    toggleStabilization,
    shutterSoundEnabled,
    toggleShutterSound,
    levelEnabled,
    toggleLevel,
    liveClassifierEnabled,
    previewMode,
    selectLivePreviewModel,
    disableLivePreview,
    frameProcessorsAvailable,
  } = useCameraPreferences();

  const {
    cameraRef,
    requestPermission,
    isPermissionPending,
    isPermissionGranted,
    toggleFacing,
    takePicture,
    capturing,
    cameraMessage,
    clearCameraMessage,
    device,
    flashMode,
    toggleFlashMode,
    facing,
    hasFlash,
    torchOn,
    toggleTorch,
    hasTorch,
    focusAt,
    gridVisible,
    toggleGrid,
    isPreviewActive,
    previewKey,
    isResumingPreview,
  } = useCameraScreen({ onPhotoCaptured, enableShutterSound: shutterSoundEnabled });

  const livePreviewSuspended = useMvpLivePreviewSuspended();
  const captureSessionActive = useMvpCaptureSessionActive();
  const livePreviewPipelineActive =
    isFocused &&
    liveClassifierEnabled &&
    !livePreviewSuspended &&
    !captureSessionActive &&
    areFrameProcessorsAvailable();
  const effectiveLiveClassifierEnabled =
    isFocused && liveClassifierEnabled && !livePreviewSuspended && !captureSessionActive;

  const {
    format,
    photoHdr,
    hdrSupported,
    stabilizationSupported,
    stabilizationEnabled: stabilizationActiveForCamera,
  } = useCameraCaptureFormat(device ?? undefined, {
    hdrEnabled,
    stabilizationEnabled,
    livePreviewEnabled: livePreviewPipelineActive,
  });
  const { zoom, setZoom, chips, activeChipId, selectChip } = useCameraZoom(device ?? undefined);

  const handleCapture = useCallback(async () => {
    await takePicture();
  }, [takePicture]);

  if (!isLoading && !isAuthenticated) {
    return <Redirect href={routes.login} />;
  }

  if (!isLive) {
    return (
      <View style={[styles.fill, { backgroundColor: theme.colors.background }, contentInsetsPadding(insets)]}>
        <RegionComingSoon feature="camera" />
      </View>
    );
  }

  const messageModal = (
    <>
      <ThemedMessageModal
        visible={cameraMessage !== null}
        title={cameraMessage?.title ?? ''}
        message={cameraMessage?.message ?? ''}
        onDismiss={clearCameraMessage}
      />
      <ThemedMessageModal
        visible={pickerNotice !== null}
        title={pickerNotice?.title ?? ''}
        message={pickerNotice?.message ?? ''}
        onDismiss={() => setPickerNotice(null)}
      />
    </>
  );

  if (isPermissionPending) {
    return (
      <>
        <View
          style={[
            styles.fill,
            { backgroundColor: theme.colors.background },
            contentInsetsPadding(insets),
          ]}>
          <ScreenCenter style={styles.transparentCenter} paddingHorizontal={0}>
            <CenteredActivityIndicator accessibilityLabel="Checking camera permission" />
          </ScreenCenter>
        </View>
        {messageModal}
      </>
    );
  }

  if (!isPermissionGranted) {
    return (
      <>
        <View
          style={[
            styles.fill,
            { backgroundColor: theme.colors.background },
            contentInsetsPadding(insets),
          ]}>
          <ScreenCenter style={styles.transparentCenter} paddingHorizontal={theme.spacing.lg}>
            <View style={[styles.permissionBlock, { gap: theme.spacing.md }]}>
              <Text style={[styles.permissionMessage, { color: theme.colors.textPrimary }]}>
                Camera access is needed to take photos. You can still identify an existing photo from
                your gallery.
              </Text>
              <AuthButton title="Allow camera" onPress={() => requestPermission()} />
              <AuthButton
                variant="outline"
                title={pickingGallery ? 'Opening gallery…' : 'Choose from gallery'}
                onPress={handlePickGallery}
                disabled={pickingGallery}
                loading={pickingGallery}
              />
            </View>
          </ScreenCenter>
        </View>
        {messageModal}
      </>
    );
  }

  return (
    <>
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        {device ? (
          <>
            <CameraLivePreviewWithClassifier
              bottomInset={insets.bottom}
              cameraRef={cameraRef}
              device={device}
              format={format}
              photoHdr={photoHdr}
              zoom={zoom}
              onZoomChange={setZoom}
              torch={torchOn ? 'on' : 'off'}
              isActive={isPreviewActive && !captureSessionActive}
              previewKey={previewKey}
              isResumingPreview={isResumingPreview}
              gridVisible={gridVisible}
              levelVisible={levelEnabled}
              stabilizationEnabled={stabilizationActiveForCamera}
              stabilizationSupported={stabilizationSupported}
              liveClassifierEnabled={effectiveLiveClassifierEnabled}
              previewMode={previewMode}
              onFocusPoint={focusAt}
              controlMenusOpen={controlMenusOpen}
              onDismissControlMenus={() => setControlMenusOpen(false)}
            />
            <CameraTopControls
              insets={insets}
              facing={facing}
              flashMode={flashMode}
              onFlashPress={toggleFlashMode}
              flashSupported={hasFlash}
              torchOn={torchOn}
              onTorchPress={toggleTorch}
              torchSupported={hasTorch}
              gridVisible={gridVisible}
              onGridPress={toggleGrid}
              hdrEnabled={hdrEnabled}
              onHdrPress={toggleHdr}
              hdrSupported={hdrSupported}
              stabilizationEnabled={stabilizationEnabled}
              onStabilizationPress={toggleStabilization}
              stabilizationSupported={stabilizationSupported}
              shutterSoundEnabled={shutterSoundEnabled}
              onShutterSoundPress={toggleShutterSound}
              levelEnabled={levelEnabled}
              onLevelPress={toggleLevel}
              liveClassifierEnabled={liveClassifierEnabled}
              frameProcessorsAvailable={frameProcessorsAvailable}
              previewMode={previewMode}
              onSelectPreviewModel={selectLivePreviewModel}
              onDisableLivePreview={disableLivePreview}
              onMenuExpandedChange={setControlMenusOpen}
            />
            <CameraZoomChips
              chips={chips}
              activeChipId={activeChipId}
              onSelectChip={selectChip}
              bottomInset={insets.bottom}
            />
          </>
        ) : (
          <View style={StyleSheet.absoluteFill}>
            <ScreenCenter style={styles.transparentCenter} paddingHorizontal={0}>
              <CenteredActivityIndicator accessibilityLabel="Starting camera" />
            </ScreenCenter>
          </View>
        )}
        <CameraBottomToolbar
          insets={insets}
          onFlip={toggleFacing}
          onCapture={handleCapture}
          capturing={capturing}
          onPickGallery={handlePickGallery}
          pickingGallery={pickingGallery}
        />
      </View>
      {messageModal}
    </>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  transparentCenter: {
    backgroundColor: 'transparent',
  },
  root: {
    flex: 1,
  },
  permissionBlock: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'stretch',
  },
  permissionMessage: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
});
