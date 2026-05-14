import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraBottomToolbar } from '@/components/camera/camera-bottom-toolbar';
import { MessageWithAction } from '@/components/screen/message-with-action';
import { ScreenCenter } from '@/components/screen/screen-center';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { authColors } from '@/constants/auth-theme';
import { screenColors } from '@/constants/screen-theme';
import { useCameraScreen } from '@/hooks/useCameraScreen';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';
import { cameraPreviewWithPhoto } from '@/lib/routing/routes';

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const onPhotoCaptured = useCallback((uri: string) => {
    router.push(cameraPreviewWithPhoto(uri));
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
  } = useCameraScreen({ onPhotoCaptured });

  const messageModal = (
    <ThemedMessageModal
      visible={cameraMessage !== null}
      title={cameraMessage?.title ?? ''}
      message={cameraMessage?.message ?? ''}
      onDismiss={clearCameraMessage}
    />
  );

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
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          ratio="1:1"
          mute
        />
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
    backgroundColor: screenColors.darkBackground,
  },
});
