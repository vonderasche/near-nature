import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { TabScreenWithLogout } from '@/components/TabScreenWithLogout';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { authSpacing } from '@/constants/auth-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/hooks/useUser';

const GALLERY_PLACEHOLDER_COUNT = 6;

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const muted = Colors[colorScheme].icon;
  const border = Colors[colorScheme].tabIconDefault;
  const tint = Colors[colorScheme].tint;

  const { user, loading, error, refresh } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.avatar_url]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const showAvatarImage = Boolean(user?.avatar_url) && !avatarFailed;

  return (
    <TabScreenWithLogout
      title="Profile"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tint}
          colors={[tint]}
        />
      }>
      {loading && !user ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={tint} accessibilityLabel="Loading profile" />
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBlock}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <Pressable
            onPress={() => void refresh()}
            style={({ pressed }) => [
              styles.retryButton,
              { borderColor: border },
              pressed && styles.retryPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Retry loading profile">
            <ThemedText type="defaultSemiBold">Try again</ThemedText>
          </Pressable>
        </View>
      ) : null}

      {user ? (
        <>
          <View style={styles.profileBlock}>
            <View style={[styles.avatarRing, { borderColor: border }]}>
              <View style={[styles.avatarInner, { backgroundColor: Colors[colorScheme].background }]}>
                {showAvatarImage ? (
                  <Image
                    source={{ uri: user.avatar_url! }}
                    style={styles.avatarImage}
                    accessibilityLabel="Profile photo"
                    onError={() => setAvatarFailed(true)}
                    onLoad={() => setAvatarFailed(false)}
                  />
                ) : (
                  <MaterialIcons name="person" size={48} color={muted} accessibilityLabel="Profile photo placeholder" />
                )}
              </View>
            </View>

            <ThemedText type="defaultSemiBold" style={styles.placeholderLine}>
              {user.first_name}
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.placeholderLine}>
              {user.last_name}
            </ThemedText>
            <ThemedText style={[styles.placeholderMuted, { color: muted }]}>{user.email}</ThemedText>
            <ThemedText style={[styles.usernameLine, { color: muted }]}>@{user.username}</ThemedText>
            <ThemedText
              style={[
                user.motto ? styles.motto : styles.mottoPlaceholder,
                { color: muted },
              ]}>
              {user.motto?.trim() ? user.motto : 'Add a short motto — it will show up here.'}
            </ThemedText>
          </View>

          <View>
            <ThemedText type="subtitle" style={styles.sectionHeading}>
              Gallery
            </ThemedText>
            <ThemedText style={[styles.sectionHint, { color: muted }]}>
              Your nature photos will appear here.
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryRow}
              accessibilityLabel="Gallery image placeholders">
              {Array.from({ length: GALLERY_PLACEHOLDER_COUNT }, (_, i) => (
                <View
                  key={i}
                  style={[styles.galleryTile, { borderColor: border }]}
                  accessibilityLabel={`Gallery placeholder ${i + 1} of ${GALLERY_PLACEHOLDER_COUNT}`}
                  accessibilityRole="image">
                  <MaterialIcons name="image" size={32} color={muted} importantForAccessibility="no" />
                </View>
              ))}
            </ScrollView>
          </View>
        </>
      ) : !loading && !error ? (
        <ThemedText style={[styles.placeholderMuted, { color: muted }]}>
          Sign in to load your profile.
        </ThemedText>
      ) : null}
    </TabScreenWithLogout>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    paddingVertical: authSpacing.lg,
  },
  errorBlock: {
    gap: authSpacing.sm,
  },
  errorText: {
    fontSize: 15,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: authSpacing.xs,
    paddingHorizontal: authSpacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryPressed: {
    opacity: 0.7,
  },
  profileBlock: {
    alignItems: 'center',
    gap: authSpacing.sm,
  },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: authSpacing.xs,
  },
  avatarInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  placeholderLine: {
    textAlign: 'center',
  },
  placeholderMuted: {
    fontSize: 15,
    textAlign: 'center',
  },
  usernameLine: {
    fontSize: 14,
    textAlign: 'center',
  },
  motto: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: authSpacing.xs,
    paddingHorizontal: authSpacing.md,
  },
  mottoPlaceholder: {
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: authSpacing.xs,
    paddingHorizontal: authSpacing.md,
  },
  sectionHeading: {
    marginBottom: authSpacing.xs,
  },
  sectionHint: {
    fontSize: 14,
    marginBottom: authSpacing.sm,
  },
  galleryRow: {
    gap: authSpacing.sm,
    paddingVertical: authSpacing.xs,
  },
  galleryTile: {
    width: 104,
    height: 104,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
