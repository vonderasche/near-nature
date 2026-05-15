import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera } from 'react-native-vision-camera';

import { CameraBottomToolbar } from '@/components/camera/camera-bottom-toolbar';
import { CameraIdentificationPanel } from '@/components/camera/camera-identification-panel';
import { MessageWithAction } from '@/components/screen/message-with-action';
import { ScreenCenter } from '@/components/screen/screen-center';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { authColors } from '@/constants/auth-theme';
import { useCameraScreen } from '@/hooks/useCameraScreen';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);

  const onPhotoCaptured = useCallback((uri: string) => {
    setCapturedPhotoUri(uri);
  }, []);

  const retake = useCallback(() => {
    setCapturedPhotoUri(null);
  }, []);

  const {
    cameraRef,
    requestPermission,
    isPermissionPending,
    isPermissionGranted,
    facing,
    toggleFacing,
    takePicture,
    capturing,
    cameraMessage,
    clearCameraMessage,
    device,
  } = useCameraScreen({ onPhotoCaptured });

  const messageModal = (
    <ThemedMessageModal
      visible={cameraMessage !== null}
      title={cameraMessage?.title ?? ''}
      message={cameraMessage?.message ?? ''}
      onDismiss={clearCameraMessage}
    />
  );

  if (capturedPhotoUri) {
    return <CameraIdentificationPanel key={capturedPhotoUri} photoUri={capturedPhotoUri} onRetake={retake} />;
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
          <MessageWithAction
            message="Camera access is needed to use this screen."
            actionLabel="Allow camera"
            onAction={() => requestPermission()}
          />
        </View>
        {messageModal}
      </>
    );
  }

  return (
    <>
      <View style={styles.root}>
        {device ? (
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive
            photo
          />
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
});
