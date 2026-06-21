import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { SectionLabel } from '@/components/shared/section-label';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  photoUri: string;
};

export function IdentificationPhotoSection({ photoUri }: Props) {
  const { theme } = useTheme();

  return (
    <>
      <SectionLabel label="This photo" />
      <View
        style={[
          styles.photoFrame,
          {
            marginBottom: theme.spacing.md,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
        ]}>
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFillObject} contentFit="contain" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  photoFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
