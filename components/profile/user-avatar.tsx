import { HeroIcon } from '@/components/ui/hero-icon';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

import type { AppTheme } from '@/constants/themes';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useStoredImageDisplayUrl } from '@/hooks/useStoredImageDisplayUrl';

const INNER_SIZE = 96;
const RING_SIZE = 112;

type UserAvatarProps = {
  /** Raw `users.avatar_url` (signed automatically for the private detections bucket). */
  storedUrl: string | null | undefined;
  /** When set, the avatar is tappable (e.g. open photo library on profile). */
  onPress?: () => void;
  /** Shows a blocking spinner over the avatar (e.g. while uploading). */
  busy?: boolean;
};

function createUserAvatarStyles(theme: AppTheme) {
  return StyleSheet.create({
    pressablePressed: {
      opacity: 0.88,
    },
    ring: {
      width: RING_SIZE,
      height: RING_SIZE,
      borderRadius: RING_SIZE / 2,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    inner: {
      width: INNER_SIZE,
      height: INNER_SIZE,
      borderRadius: INNER_SIZE / 2,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      backgroundColor: theme.colors.fieldBackground,
    },
    image: {
      width: INNER_SIZE,
      height: INNER_SIZE,
      borderRadius: INNER_SIZE / 2,
    },
    busyOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.overlayScrim,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export function UserAvatar({ storedUrl, onPress, busy = false }: UserAvatarProps) {
  const styles = useThemedStyles(createUserAvatarStyles);
  const { theme } = useTheme();
  const displayUri = useStoredImageDisplayUrl(storedUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [storedUrl, displayUri]);

  const showImage = Boolean(displayUri?.trim()) && !failed;

  const body = (
    <View style={styles.ring}>
      <View style={styles.inner}>
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
          <HeroIcon name="user" size={48} color={theme.colors.textMuted} />
        )}
        {busy ? (
          <View style={styles.busyOverlay} pointerEvents="none" accessibilityLabel="Updating profile photo">
            <ActivityIndicator color={theme.colors.textPrimary} />
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
