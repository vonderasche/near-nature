import { CameraView } from 'expo-camera';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useCameraScreen } from '@/hooks/useCameraScreen';

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const {
    cameraRef,
    requestPermission,
    isPermissionPending,
    isPermissionGranted,
    facing,
    toggleFacing,
    takePicture,
    capturing,
  } = useCameraScreen();

  if (isPermissionPending) {
    return (
      <View style={[styles.centered, { paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isPermissionGranted) {
    return (
      <View style={[styles.centered, styles.pad, { paddingBottom: insets.bottom }]}>
        <Text style={styles.message}>Camera access is needed to use this screen.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => requestPermission()}
          style={styles.permissionBtn}>
          <Text style={styles.permissionBtnText}>Allow camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
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
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authColors.background,
  },
  pad: {
    paddingHorizontal: authSpacing.lg,
  },
  message: {
    ...authTypography.body,
    color: authColors.text,
    textAlign: 'center',
    marginBottom: authSpacing.md,
  },
  permissionBtn: {
    borderWidth: 1,
    borderColor: authColors.border,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.lg,
  },
  permissionBtnText: {
    ...authTypography.body,
    fontWeight: '600',
    color: authColors.text,
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
