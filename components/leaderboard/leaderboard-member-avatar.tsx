import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { authColors } from '@/constants/auth-theme';
import { getDetectionImageDisplayUrl } from '@/services/detectionImageUrl';

const SIZE = 44;

type LeaderboardMemberAvatarProps = {
  /** Stored `users.avatar_url` (often a public bucket URL that still needs signing when private). */
  storedUrl: string | null | undefined;
  borderColor: string;
  mutedColor: string;
};

/**
 * Small circular avatar for leaderboard rows; mirrors profile/gallery signing for the detections bucket.
 */
export function LeaderboardMemberAvatar({ storedUrl, borderColor, mutedColor }: LeaderboardMemberAvatarProps) {
  const [uri, setUri] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    const raw = storedUrl?.trim();
    if (!raw) {
      setUri(null);
      return;
    }
    setUri(null);
    void getDetectionImageDisplayUrl(raw).then((u) => {
      if (!cancelled) setUri(u.trim().length > 0 ? u : null);
    });
    return () => {
      cancelled = true;
    };
  }, [storedUrl]);

  const showImage = Boolean(uri?.trim()) && !failed;

  return (
    <View style={[styles.ring, { borderColor }]} accessibilityLabel="Member avatar">
      {showImage ? (
        <Image
          source={{ uri: uri! }}
          style={styles.image}
          contentFit="cover"
          transition={150}
          onError={() => setFailed(true)}
        />
      ) : (
        <MaterialIcons name="person" size={24} color={mutedColor} accessibilityLabel="No profile photo" />
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
