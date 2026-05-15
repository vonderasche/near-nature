import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CenteredActivityIndicator } from '@/components/profile/centered-activity-indicator';
import { DetectionGalleryGrid } from '@/components/profile/detection-gallery-grid';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { PublicUserProfileSummary } from '@/components/profile/public-user-profile-summary';
import { ProfileStatStrip } from '@/components/profile/profile-stat-strip';
import { profileStatStripPropsFromPublicProfile } from '@/components/profile/profile-stats-from-public-profile';
import { ScreenSection } from '@/components/profile/screen-section';
import { UserAvatar } from '@/components/profile/user-avatar';
import { Colors } from '@/constants/theme';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePublicUserProfile } from '@/hooks/usePublicUserProfile';
import { useUserDetectionGallery } from '@/hooks/useUserDetectionGallery';
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
  const {
    items: galleryItems,
    isLoading: galleryLoading,
    error: galleryError,
    refetch: refetchGallery,
  } = useUserDetectionGallery({ userId, limit: 24, publicOnly: true });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), refetchGallery()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, refetchGallery]);

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
                <UserAvatar imageUri={profile.avatar_url} mutedIconColor={muted} borderColor={border} />
                <ProfileStatStrip {...profileStatStripPropsFromPublicProfile(profile, muted, tint)} />
                <PublicUserProfileSummary
                  username={profile.username}
                  motto={profile.motto}
                  mutedColor={muted}
                />
              </View>

              <ScreenSection
                title="Gallery"
                hint="Public identification photos they saved (non-sensitive)."
                hintColor={muted}>
                <DetectionGalleryGrid
                  items={galleryItems}
                  loading={galleryLoading}
                  error={galleryError}
                  onRetry={() => void refetchGallery()}
                  borderColor={border}
                  mutedColor={muted}
                  activityColor={tint}
                  emptyMessage="No public photos yet. Sensitive or private saves are not shown here."
                />
              </ScreenSection>
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
