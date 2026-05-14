import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { SectionLabel } from '@/components/screen/section-label';
import { authColors, authSpacing } from '@/constants/auth-theme';

type Props = {
  photoUri: string;
};

export function IdentificationPhotoSection({ photoUri }: Props) {
  return (
    <>
      <SectionLabel label="This photo" />
      <View style={styles.photoFrame}>
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFillObject} contentFit="contain" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  photoFrame: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: authSpacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: authColors.border,
    backgroundColor: authColors.fieldBackground,
    overflow: 'hidden',
  },
});
