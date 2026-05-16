import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { authColors } from '@/constants/auth-theme';
import { useStoredImageDisplayUrl } from '@/hooks/useStoredImageDisplayUrl';

const SIZE = 44;

type ExplorerBoardMemberAvatarProps = {
  /** Image URL (profile avatar, species photo, etc.). Non-detection URLs are used as-is. */
  storedUrl: string | null | undefined;
  borderColor: string;
  mutedColor: string;
  /** Shown when there is no image or load fails. */
  fallbackIcon?: React.ComponentProps<typeof MaterialIcons>['name'];
};

/**
 * Small circular avatar for explorer board rows (and other list cards using the same signing).
 */
export function ExplorerBoardMemberAvatar({
  storedUrl,
  borderColor,
  mutedColor,
  fallbackIcon = 'person',
}: ExplorerBoardMemberAvatarProps) {
  const displayUri = useStoredImageDisplayUrl(storedUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [storedUrl, displayUri]);

  const showImage = Boolean(displayUri?.trim()) && !failed;

  return (
    <View style={[styles.ring, { borderColor }]} accessibilityLabel="Member avatar">
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
        <MaterialIcons name={fallbackIcon} size={24} color={mutedColor} accessibilityLabel="No photo" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authColors.fieldBackground,
  },
  image: {
    width: SIZE,
    height: SIZE,
  },
});
