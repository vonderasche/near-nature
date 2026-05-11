import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

export default function CameraPreviewScreen() {
  const insets = useSafeAreaInsets();
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const photoUri = typeof uri === 'string' ? uri : Array.isArray(uri) ? uri[0] : undefined;

  function goBackToCamera() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/camera');
  }

  function goToIdentification() {
    if (!photoUri) return;
    router.push({
      pathname: '/(tabs)/identification-results',
      params: { uri: photoUri },
    });
  }

  if (!photoUri) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={styles.message}>No photo to preview.</Text>
        <Pressable accessibilityRole="button" onPress={goBackToCamera} style={styles.btn}>
          <Text style={styles.btnText}>Back to camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: photoUri }} style={styles.image} contentFit="contain" />
      </View>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={goBackToCamera} style={styles.secondary}>
          <Text style={styles.secondaryText}>Retake</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={goToIdentification} style={styles.primary}>
          <Text style={styles.primaryText}>Done</Text>
        </Pressable>
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
    paddingHorizontal: authSpacing.lg,
    backgroundColor: authColors.background,
  },
  message: {
    ...authTypography.body,
    color: authColors.text,
    textAlign: 'center',
    marginBottom: authSpacing.md,
  },
  imageWrap: {
    flex: 1,
    marginHorizontal: authSpacing.sm,
    marginVertical: authSpacing.sm,
  },
  image: {
    flex: 1,
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: authSpacing.md,
    paddingHorizontal: authSpacing.lg,
    paddingTop: authSpacing.md,
  },
  btn: {
    borderWidth: 1,
    borderColor: authColors.border,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.lg,
  },
  btnText: {
    ...authTypography.body,
    fontWeight: '600',
    color: authColors.text,
  },
  secondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: authSpacing.sm,
    alignItems: 'center',
  },
  secondaryText: {
    ...authTypography.body,
    fontWeight: '600',
    color: '#fff',
  },
  primary: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: authSpacing.sm,
    alignItems: 'center',
  },
  primaryText: {
    ...authTypography.body,
    fontWeight: '600',
    color: '#000',
  },
});
