import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhotoReviewActions } from '@/components/camera/photo-review-actions';
import { MessageWithAction } from '@/components/screen/message-with-action';
import { authColors, authSpacing } from '@/constants/auth-theme';
import { screenColors } from '@/constants/screen-theme';
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
      <View style={styles.imageWrap}>
        <Image source={{ uri: photoUri }} style={styles.image} contentFit="contain" />
      </View>
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
    backgroundColor: screenColors.darkBackground,
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
});
