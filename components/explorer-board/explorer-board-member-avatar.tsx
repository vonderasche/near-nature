import { HeroIcon, type HeroIconName } from '@/components/ui/hero-icon';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { useStoredImageDisplayUrl } from '@/hooks/useStoredImageDisplayUrl';

const SIZE = 44;

type ExplorerBoardMemberAvatarProps = {
  /** Image URL (profile avatar, species photo, etc.). Non-detection URLs are used as-is. */
  storedUrl: string | null | undefined;
  /**
   * Pre-resolved display URL (Explorer Board batch signing).
   * When set, local signing is skipped; `null` shows the fallback icon.
   */
  displayUri?: string | null;
  /** Shown when there is no image or load fails. */
  fallbackIcon?: HeroIconName;
};

/**
 * Small circular avatar for Explorer Board rows (and other list cards using the same signing).
 */
export function ExplorerBoardMemberAvatar({
  storedUrl,
  displayUri: displayUriProp,
  fallbackIcon = 'user',
}: ExplorerBoardMemberAvatarProps) {
  const { theme } = useTheme();
  const signedLocally = useStoredImageDisplayUrl(displayUriProp === undefined ? storedUrl : null);
  const displayUri = displayUriProp !== undefined ? displayUriProp : signedLocally;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [storedUrl, displayUri]);

  const showImage = Boolean(displayUri?.trim()) && !failed;

  const ringStyle = useMemo(
    () => ({
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    }),
    [theme],
  );

  return (
    <View style={[styles.ring, ringStyle]} accessibilityLabel="Member avatar">
      {showImage ? (
        <Image
          key={displayUri}
          source={{ uri: displayUri! }}
          style={styles.image}
          contentFit="cover"
          transition={150}
          onError={() => setFailed(true)}
        />
      ) : (
        <HeroIcon name={fallbackIcon ?? 'user'} size={24} color={theme.colors.textSecondary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: SIZE,
    height: SIZE,
    borderRadius: 0,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SIZE,
    height: SIZE,
  },
});
