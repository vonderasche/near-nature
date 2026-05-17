import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { CameraBottomToolbar } from '@/components/camera/camera-bottom-toolbar';
import { CameraLivePreview } from '@/components/camera/camera-live-preview';
import { CameraTopControls } from '@/components/camera/camera-top-controls';
import { CameraZoomChips } from '@/components/camera/camera-zoom-chips';
import { useCameraCaptureFormat } from '@/hooks/useCameraCaptureFormat';
import { useCameraZoom } from '@/hooks/useCameraZoom';
import { CameraIdentificationPanel } from '@/components/camera/camera-identification-panel';
import { ScreenCenter } from '@/components/shared/screen-center';
import { NewSpeciesDiscoveryModal } from '@/components/camera/identification/new-species-discovery-modal';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import type { NewSpeciesDiscovery } from '@/types/species-discovery';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useCameraScreen } from '@/hooks/useCameraScreen';
import { usePickPhotoFromGallery } from '@/hooks/usePickPhotoFromGallery';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [pickerNotice, setPickerNotice] = useState<{ title: string; message: string } | null>(null);
  const [backgroundSaveError, setBackgroundSaveError] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [newSpeciesDiscovery, setNewSpeciesDiscovery] = useState<NewSpeciesDiscovery | null>(null);

  const onPhotoCaptured = useCallback((uri: string) => {
    setCapturedPhotoUri(uri);
  }, []);

  const retake = useCallback(() => {
    setCapturedPhotoUri(null);
  }, []);

  const { pickFromGallery, picking: pickingGallery } = usePickPhotoFromGallery();

  const handlePickGallery = useCallback(async () => {
    const result = await pickFromGallery();
    if (result.ok) {
      setCapturedPhotoUri(result.uri);
      return;
    }
    if (result.reason === 'permission' || result.reason === 'error') {
      setPickerNotice({
        title: result.reason === 'permission' ? 'Photos access' : 'Gallery',
        message: result.message,
      });
    }
  }, [pickFromGallery]);

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
    hasFlash,
    torchOn,
    toggleTorch,
    hasTorch,
    focusAt,
  } = useCameraScreen({ onPhotoCaptured });

  const { format, photoHdr } = useCameraCaptureFormat(device ?? undefined);
  const { zoom, chips, activeChipId, selectChip } = useCameraZoom(device ?? undefined);

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
      <ThemedMessageModal
        visible={backgroundSaveError !== null}
        title={backgroundSaveError?.title ?? ''}
        message={backgroundSaveError?.message ?? ''}
        onDismiss={() => setBackgroundSaveError(null)}
      />
      <NewSpeciesDiscoveryModal
        visible={newSpeciesDiscovery !== null}
        discovery={newSpeciesDiscovery}
        onDismiss={() => setNewSpeciesDiscovery(null)}
      />
    </>
  );

  if (capturedPhotoUri) {
    return (
      <CameraIdentificationPanel
        key={capturedPhotoUri}
        photoUri={capturedPhotoUri}
        onRetake={retake}
        onBackgroundSaveError={(message) =>
          setBackgroundSaveError({
            title: 'Save failed',
            message,
          })
        }
        onNewSpeciesDiscovery={setNewSpeciesDiscovery}
      />
    );
  }

  if (isPermissionPending) {
    return (
      <>
        <View style={[styles.fill, screenShell, contentInsetsPadding(insets)]}>
          <ScreenCenter style={styles.transparentCenter} paddingHorizontal={0}>
            <ActivityIndicator size="large" color={authColors.text} />
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
            <CameraLivePreview
              cameraRef={cameraRef}
              device={device}
              format={format}
              photoHdr={photoHdr}
              zoom={zoom}
              torch={torchOn ? 'on' : 'off'}
              onFocusPoint={focusAt}
            />
            <CameraZoomChips
              chips={chips}
              activeChipId={activeChipId}
              onSelectChip={selectChip}
              bottomInset={insets.bottom}
            />
            <CameraTopControls
              insets={insets}
              flashMode={flashMode}
              onFlashPress={toggleFlashMode}
              hasFlash={hasFlash}
              torchOn={torchOn}
              onTorchPress={toggleTorch}
              hasTorch={hasTorch}
            />
          </>
        ) : (
          <View style={StyleSheet.absoluteFill}>
            <ScreenCenter style={styles.transparentCenter} paddingHorizontal={0}>
              <ActivityIndicator size="large" color={authColors.text} />
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
