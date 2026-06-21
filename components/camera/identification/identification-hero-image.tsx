import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

type Props = {
  photoUri: string;
};

export function IdentificationHeroImage({ photoUri }: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.frame,
        {
          borderRadius: theme.radii.md,
          backgroundColor: theme.colors.surface,
          marginBottom: theme.spacing.lg,
        },
      ]}>
      <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFillObject} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
  },
});
