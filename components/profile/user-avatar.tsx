import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { authSpacing } from '@/constants/auth-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const INNER_SIZE = 96;
const RING_SIZE = 112;

type UserAvatarProps = {
  imageUri: string | null | undefined;
  mutedIconColor: string;
  borderColor: string;
};

export function UserAvatar({ imageUri, mutedIconColor, borderColor }: UserAvatarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const bg = Colors[colorScheme].background;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageUri]);

  const showImage = Boolean(imageUri?.trim()) && !failed;

  return (
    <View style={[styles.ring, { borderColor }]}>
      <View style={[styles.inner, { backgroundColor: bg }]}>
        {showImage ? (
          <Image
            source={{ uri: imageUri! }}
            style={styles.image}
            accessibilityLabel="Profile photo"
            onError={() => setFailed(true)}
            onLoad={() => setFailed(false)}
          />
        ) : (
          <MaterialIcons name="person" size={48} color={mutedIconColor} accessibilityLabel="Profile photo placeholder" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: authSpacing.xs,
  },
  inner: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
  },
});
