import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { authColors, authSpacing } from '@/constants/auth-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStoredImageDisplayUrl } from '@/hooks/useStoredImageDisplayUrl';

const INNER_SIZE = 96;
const RING_SIZE = 112;

type UserAvatarProps = {
  /** Raw `users.avatar_url` (signed automatically for the private detections bucket). */
  storedUrl: string | null | undefined;
  mutedIconColor: string;
  borderColor: string;
  /** When set, the avatar is tappable (e.g. open photo library on profile). */
  onPress?: () => void;
  /** Shows a blocking spinner over the avatar (e.g. while uploading). */
  busy?: boolean;
};

export function UserAvatar({
  storedUrl,
  mutedIconColor,
  borderColor,
  onPress,
  busy = false,
}: UserAvatarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const bg = Colors[colorScheme].background;
  const displayUri = useStoredImageDisplayUrl(storedUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [storedUrl, displayUri]);

  const showImage = Boolean(displayUri?.trim()) && !failed;

  const body = (
    <View style={[styles.ring, { borderColor }]}>
      <View style={[styles.inner, { backgroundColor: bg }]}>
        {showImage ? (
          <Image
            key={displayUri}
            source={{ uri: displayUri! }}
            style={styles.image}
            accessibilityLabel="Profile photo"
            onError={() => setFailed(true)}
            onLoad={() => setFailed(false)}
          />
        ) : (
          <MaterialIcons name="person" size={48} color={mutedIconColor} accessibilityLabel="Profile photo placeholder" />
        )}
        {busy ? (
          <View style={styles.busyOverlay} pointerEvents="none" accessibilityLabel="Updating profile photo">
            <ActivityIndicator color={authColors.text} />
          </View>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Change profile photo"
        accessibilityHint="Opens your photo library"
        style={({ pressed }) => [pressed && styles.pressablePressed]}>
        {body}
      </Pressable>
    );
  }

  return body;
}

const styles = StyleSheet.create({
  pressablePressed: {
    opacity: 0.88,
  },
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
    position: 'relative',
  },
  image: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
  },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
