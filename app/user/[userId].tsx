import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CenteredActivityIndicator } from '@/components/shared/centered-activity-indicator';
import {
  ProfileEarnedBadgesSection,
  type ProfileEarnedBadgesSectionHandle,
} from '@/components/profile/profile-earned-badges-section';
import {
  UserDetectionGallerySection,
  type UserDetectionGallerySectionHandle,
} from '@/components/profile/user-detection-gallery-section';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { PublicUserProfileSummary } from '@/components/profile/public-user-profile-summary';
import { ProfileStatStrip } from '@/components/profile/profile-stat-strip';
import { profileStatStripPropsFromPublicProfile } from '@/lib/profile/profileStatStripFromPublicProfile';
import { UserAvatar } from '@/components/profile/user-avatar';
import { Colors } from '@/constants/auth-theme';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePublicUserProfile } from '@/hooks/usePublicUserProfile';
import { paramToString } from '@/lib/routing/searchParams';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PublicUserProfileScreen() {
  const raw = useLocalSearchParams<{ userId?: string | string[] }>().userId;
  const userId = paramToString(raw);

  const colorScheme = useColorScheme() ?? 'light';
  const muted = Colors[colorScheme].icon;
  const border = Colors[colorScheme].tabIconDefault;
  const tint = Colors[colorScheme].tint;

  const insets = useSafeAreaInsets();
  const edge = contentInsetsPadding(insets);

  const { profile, isLoading, error, refetch } = usePublicUserProfile(userId);
  const galleryRef = useRef<UserDetectionGallerySectionHandle>(null);
  const badgesRef = useRef<ProfileEarnedBadgesSectionHandle>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const galleryPromise = galleryRef.current?.refetch() ?? Promise.resolve();
      const badgesPromise = badgesRef.current?.refetch() ?? Promise.resolve();
      await Promise.all([refetch(), galleryPromise, badgesPromise]);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const headerTitle = profile?.username ?? 'Member';

  if (!userId) {
    return (
      <>
        <Stack.Screen options={{ title: 'Profile' }} />
        <View style={[styles.fill, edge, styles.padH]}>
          <Text style={[styles.missing, { color: muted }]}>Missing member id.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: headerTitle }} />
      <View style={styles.fill}>
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: edge.paddingTop,
              paddingBottom: edge.paddingBottom + authSpacing.xl,
              paddingHorizontal: authSpacing.lg,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={tint}
              colors={[tint]}
            />
          }>
          {isLoading && !profile ? (
            <CenteredActivityIndicator color={tint} accessibilityLabel="Loading profile" />
          ) : null}

          {error ? (
            <ErrorRetryBlock
              message={error}
              onRetry={() => void refetch()}
              borderColor={border}
              retryLabel="Try again"
            />
          ) : null}

          {profile ? (
            <>
              <View style={styles.profileHero}>
                <UserAvatar
                  storedUrl={profile.avatar_url}
                  mutedIconColor={authColors.textMuted}
                  borderColor={authColors.border}
                />
                <ProfileStatStrip
                  {...profileStatStripPropsFromPublicProfile(
                    profile,
                    authColors.textMuted,
                    authColors.text,
                  )}
                />
                <PublicUserProfileSummary
                  username={profile.username}
                  motto={profile.motto}
                  state={profile.state}
                  mutedColor={authColors.textMuted}
                />
              </View>

              <ProfileEarnedBadgesSection
                ref={badgesRef}
                userId={userId}
                borderColor={border}
                mutedColor={muted}
              />

              <UserDetectionGallerySection
                ref={galleryRef}
                userId={userId}
                publicOnly
                searchPlaceholder="Search this member's identifications…"
                emptyMessage="No public photos yet. Sensitive or private saves are not shown here."
              />
            </>
          ) : null}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  scrollContent: {
    gap: authSpacing.lg,
  },
  profileHero: {
    alignItems: 'center',
    gap: authSpacing.sm,
    marginBottom: authSpacing.md,
  },
  padH: {
    paddingHorizontal: authSpacing.lg,
  },
  missing: {
    ...authTypography.subtitle,
    textAlign: 'center',
    paddingVertical: authSpacing.md,
  },
});
