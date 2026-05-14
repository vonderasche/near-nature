import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhotoReviewActions } from '@/components/camera/photo-review-actions';
import { MessageWithAction } from '@/components/screen/message-with-action';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';
import { identificationResultsWithPhoto, routes } from '@/lib/routing/routes';
import { normalizePhotoUri, paramToString } from '@/lib/routing/searchParams';

export default function CameraPreviewScreen() {
  const insets = useSafeAreaInsets();
  const { uri } = useLocalSearchParams<{ uri?: string | string[] }>();
  const photoUri = normalizePhotoUri(paramToString(uri));

  function goBackToCamera() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(routes.camera);
  }

  function goToIdentification() {
    if (!photoUri) return;
    router.push(identificationResultsWithPhoto(photoUri));
  }

  if (!photoUri) {
    return (
      <View style={[styles.fill, styles.shellLight, contentInsetsPadding(insets)]}>
        <MessageWithAction
          message="No photo to preview."
          actionLabel="Back to camera"
          onAction={goBackToCamera}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, contentInsetsPadding(insets)]}>
      <View style={styles.imageColumn}>
        <View style={styles.squareFrame}>
          <Image
            source={{ uri: photoUri }}
            style={StyleSheet.absoluteFillObject}
            contentFit="contain"
          />
        </View>
      </View>
      <Text style={styles.hint} accessibilityRole="text">
        Tap Done to identify this photo, or Retake to try again.
      </Text>
      <PhotoReviewActions
        secondaryLabel="Retake"
        onSecondary={goBackToCamera}
        primaryLabel="Done"
        onPrimary={goToIdentification}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  shellLight: {
    backgroundColor: authColors.background,
  },
  root: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  imageColumn: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginHorizontal: authSpacing.sm,
    marginVertical: authSpacing.sm,
  },
  squareFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: authColors.background,
    borderWidth: 1,
    borderColor: authColors.border,
  },
  hint: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    textAlign: 'center',
    marginBottom: authSpacing.sm,
    paddingHorizontal: authSpacing.md,
  },
});
