import { Redirect, useRouter, type Href } from 'expo-router';
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
import { useCameraPreferences } from '@/hooks/useCameraPreferences';
import { useCameraZoom } from '@/hooks/useCameraZoom';
import { CenteredActivityIndicator } from '@/components/shared/centered-activity-indicator';
import { ScreenCenter } from '@/components/shared/screen-center';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useCameraScreen } from '@/hooks/useCameraScreen';
import { usePickPhotoFromGallery } from '@/hooks/usePickPhotoFromGallery';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';

export default function CameraScreen() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pickerNotice, setPickerNotice] = useState<{ title: string; message: string } | null>(null);
  const [controlMenusOpen, setControlMenusOpen] = useState(false);

  const navigateToIdentification = useCallback(
    (uri: string) => {
      router.push(routeCameraIdentification({ uri }) as unknown as Href);
    },
    [router],
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
    toggleLiveClassifier,
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

  const { format, photoHdr, hdrSupported, stabilizationSupported } = useCameraCaptureFormat(
    device ?? undefined,
    { hdrEnabled, stabilizationEnabled },
  );
  const { zoom, setZoom, chips, activeChipId, selectChip } = useCameraZoom(device ?? undefined);

  if (!isLoading && !isAuthenticated) {
    return <Redirect href={routes.login} />;
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
        <View style={[styles.fill, screenShell, contentInsetsPadding(insets)]}>
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
        <View style={[styles.fill, screenShell, contentInsetsPadding(insets)]}>
          <ScreenCenter style={styles.transparentCenter} paddingHorizontal={authSpacing.lg}>
            <View style={styles.permissionBlock}>
              <Text style={styles.permissionMessage}>
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
      <View style={styles.root}>
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
              isActive={isPreviewActive}
              previewKey={previewKey}
              isResumingPreview={isResumingPreview}
              gridVisible={gridVisible}
              levelVisible={levelEnabled}
              stabilizationEnabled={stabilizationEnabled}
              stabilizationSupported={stabilizationSupported}
              liveClassifierEnabled={liveClassifierEnabled}
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
              onLiveClassifierPress={toggleLiveClassifier}
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
          onCapture={takePicture}
          capturing={capturing}
          onPickGallery={handlePickGallery}
          pickingGallery={pickingGallery}
        />
      </View>
      {messageModal}
    </>
  );
}

const screenShell = {
  backgroundColor: authColors.background,
} as const;

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  transparentCenter: {
    backgroundColor: 'transparent',
  },
  root: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  permissionBlock: {
    width: '100%',
    maxWidth: 400,
    gap: authSpacing.md,
    alignItems: 'stretch',
  },
  permissionMessage: {
    ...authTypography.body,
    color: authColors.text,
    textAlign: 'center',
  },
});
