import { useCallback, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { StackScreenHeader } from '@/components/ui/StackScreenHeader';
import { usePublicGalleryPrefs } from '@/context/PublicGalleryContext';
import { useTheme } from '@/hooks/useTheme';
import { usePublicUserProfile } from '@/hooks/usePublicUserProfile';
import { stageGalleryItem } from '@/lib/gallery/galleryItemRouteCache';
import {
  routePublicUserDetection,
  routePublicUserGalleryFilter,
} from '@/lib/routing/routes';
import { paramToString } from '@/lib/routing/searchParams';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';
import type { DetectionGalleryItem } from '@/types';

function PublicUserProfileBody({ userId }: { userId: string }) {
  const router = useRouter();
  const { theme } = useTheme();
  const { categoryFilter, setCategoryFilter } = usePublicGalleryPrefs();
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

  const openDetection = useCallback(
    (item: DetectionGalleryItem) => {
      stageGalleryItem(item);
      router.push(
        routePublicUserDetection({ userId, detectionId: item.id }) as unknown as Href,
      );
    },
    [router, userId],
  );

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: edge.paddingTop,
            paddingBottom: edge.paddingBottom + theme.spacing.xl,
            paddingHorizontal: theme.spacing.lg,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.textPrimary}
            colors={[theme.colors.textPrimary]}
          />
        }>
        {isLoading && !profile ? (
          <CenteredActivityIndicator accessibilityLabel="Loading profile" />
        ) : null}

        {error ? (
          <ErrorRetryBlock message={error} onRetry={() => void refetch()} retryLabel="Try again" />
        ) : null}

        {profile ? (
          <>
            <StackScreenHeader title={profile.username} subtitle="Member profile" />
            <View style={[styles.profileHero, { gap: theme.spacing.sm, marginBottom: theme.spacing.md }]}>
              <UserAvatar storedUrl={profile.avatar_url} />
              <ProfileStatStrip {...profileStatStripPropsFromPublicProfile(profile)} />
              <PublicUserProfileSummary
                username={profile.username}
                motto={profile.motto}
                state={profile.state}
              />
            </View>

            <ProfileEarnedBadgesSection ref={badgesRef} userId={userId} />

            <UserDetectionGallerySection
              ref={galleryRef}
              userId={userId}
              publicOnly
              searchPlaceholder="Search this member's identifications…"
              emptyMessage="No public photos yet. Sensitive or private saves are not shown here."
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              onOpenCategoryFilter={() =>
                router.push(routePublicUserGalleryFilter(userId) as unknown as Href)
              }
              onOpenDetection={openDetection}
            />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

export default function PublicUserProfileScreen() {
  const raw = useLocalSearchParams<{ userId?: string | string[] }>().userId;
  const userId = paramToString(raw);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const edge = contentInsetsPadding(insets);

  if (!userId) {
    return (
      <View style={[styles.fill, edge, styles.padH, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>Missing member id.</Text>
      </View>
    );
  }

  return <PublicUserProfileBody userId={userId} />;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  scrollContent: {
    gap: 16,
  },
  profileHero: {
    alignItems: 'center',
  },
  padH: {
    paddingHorizontal: 16,
  },
});
