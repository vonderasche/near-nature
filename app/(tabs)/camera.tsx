import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MessageWithAction } from '@/components/screen/message-with-action';
import { ScreenCenter } from '@/components/screen/screen-center';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useCameraScreen } from '@/hooks/useCameraScreen';
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
  } = useCameraScreen({ onPhotoCaptured });

  if (isPermissionPending) {
    return (
      <View style={[styles.fill, { paddingBottom: insets.bottom }]}>
        <ScreenCenter>
          <ActivityIndicator size="large" color={authColors.text} />
        </ScreenCenter>
      </View>
    );
  }

  if (!isPermissionGranted) {
    return (
      <View style={[styles.fill, { paddingBottom: insets.bottom }]}>
        <MessageWithAction
          message="Camera access is needed to use this screen."
          actionLabel="Allow camera"
          onAction={() => requestPermission()}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        ratio="4:3"
        mute
      />
      <View style={[styles.toolbar, { paddingBottom: Math.max(insets.bottom, authSpacing.md) }]}>
        <Pressable accessibilityRole="button" onPress={toggleFacing} style={styles.toolBtn}>
          <Text style={styles.toolBtnText}>Flip</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={takePicture}
          disabled={capturing}
          style={[styles.capture, capturing && styles.captureDisabled]}>
          <View style={styles.captureInner} />
        </Pressable>
        <View style={styles.toolSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  toolbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: authSpacing.lg,
    paddingTop: authSpacing.md,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  toolBtn: {
    minWidth: 64,
    paddingVertical: authSpacing.sm,
  },
  toolBtnText: {
    ...authTypography.body,
    color: '#fff',
    fontWeight: '600',
  },
  toolSpacer: {
    minWidth: 64,
  },
  capture: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
});
