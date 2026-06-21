import { useFocusEffect } from '@react-navigation/native';
import { Redirect, useRouter, type Href } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { useAuthContext } from '@/context/AuthContext';
import { useGalleryCategoryFilter } from '@/context/GalleryCategoryFilterContext';
import {
  routeProfileDetection,
  routes,
} from '@/lib/routing/routes';

import { TabScreenWithLogout } from '@/components/layout/tab-screen-with-logout';
import {
  ProfileScoringCollapsible,
  type ProfileScoringCollapsibleHandle,
} from '@/components/profile/profile-scoring-collapsible';
import { CenteredActivityIndicator } from '@/components/shared/centered-activity-indicator';
import { ProfileSettingsButton } from '@/components/profile/profile-settings-button';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { Button } from '@/components/ui/Button';
import { THEME_LABELS } from '@/constants/theme-preferences';
import {
  UserDetectionGallerySection,
  type UserDetectionGallerySectionHandle,
} from '@/components/profile/user-detection-gallery-section';
import { ProfileStatStrip } from '@/components/profile/profile-stat-strip';
import { profileStatStripPropsFromPublicProfile } from '@/lib/profile/profileStatStripFromPublicProfile';
import { ProfileUserIdentity } from '@/components/profile/profile-user-identity';
import { UserAvatar } from '@/components/profile/user-avatar';
import { UserProfileSummary } from '@/components/profile/user-profile-summary';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { useTheme } from '@/hooks/useTheme';
import { useAvatarFromGallery } from '@/hooks/useAvatarFromGallery';
import { useDeleteDetection } from '@/hooks/useDeleteDetection';
import { useUser } from '@/hooks/useUser';
import { requestExplorerBoardRefresh } from '@/lib/explorerBoard/explorerBoardRefresh';
import { stageGalleryItem } from '@/lib/gallery/galleryItemRouteCache';
import type { DetectionGalleryItem } from '@/types';

export default function ProfileScreen() {
  const { theme, themeName } = useTheme();
  const router = useRouter();
  const { categoryFilter, setCategoryFilter } = useGalleryCategoryFilter();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const {
    user,
    stats,
    loading,
    refreshing: profileRefreshing,
    error,
    refresh,
    update,
  } = useUser();
  const { deleteById, deletingId } = useDeleteDetection();
  const galleryRef = useRef<UserDetectionGallerySectionHandle>(null);
  const scoringRef = useRef<ProfileScoringCollapsibleHandle>(null);
  const [avatarPickError, setAvatarPickError] = useState<string | null>(null);
  const { pickAndSetAvatar, busy: avatarBusy } = useAvatarFromGallery(user?.id, update);

  const onAvatarPress = useCallback(() => {
    setAvatarPickError(null);
    void (async () => {
      const r = await pickAndSetAvatar();
      if (r.ok) {
        requestExplorerBoardRefresh();
        return;
      }
      if ('canceled' in r && r.canceled) return;
      setAvatarPickError('message' in r ? r.message : 'Something went wrong.');
    })();
  }, [pickAndSetAvatar]);

  const [pullRefreshing, setPullRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setPullRefreshing(true);
    try {
      const galleryPromise = galleryRef.current?.refetch() ?? Promise.resolve();
      const scoringPromise = scoringRef.current?.refetch() ?? Promise.resolve();
      await Promise.all([refresh({ force: true }), galleryPromise, scoringPromise]);
    } finally {
      setPullRefreshing(false);
    }
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void scoringRef.current?.refetch();
      void galleryRef.current?.refetch();
    }, [refresh]),
  );

  const handleGalleryDelete = useCallback(
    async (item: DetectionGalleryItem) => {
      const r = await deleteById(item.id);
      if (r.ok) {
        await Promise.all([galleryRef.current?.refetch(), refresh()]);
      }
      return r;
    },
    [deleteById, refresh],
  );

  const openDetection = useCallback(
    (item: DetectionGalleryItem) => {
      stageGalleryItem(item);
      router.push(routeProfileDetection({ detectionId: item.id }) as unknown as Href);
    },
    [router],
  );

  const statsSlot = stats ? (
    <ProfileStatStrip {...profileStatStripPropsFromPublicProfile(stats)} />
  ) : null;

  if (!authLoading && !isAuthenticated) {
    return <Redirect href={routes.login} />;
  }

  return (
    <TabScreenWithLogout
      title="Profile"
      hideLogout={Boolean(user)}
      titleAccessory={user ? <ProfileSettingsButton /> : undefined}
      refreshControl={
        <RefreshControl
          refreshing={pullRefreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.textPrimary}
          colors={[theme.colors.textPrimary]}
        />
      }
      backgroundRefreshing={profileRefreshing && !pullRefreshing}>
      {loading && !user ? (
        <CenteredActivityIndicator
          color={theme.colors.textPrimary}
          accessibilityLabel="Loading profile"
        />
      ) : null}

      {error ? (
        <ErrorRetryBlock message={error} onRetry={() => void refresh()} retryLabel="Try again" />
      ) : null}

      {user ? (
        <>
          <View style={[styles.profileHero, { gap: theme.spacing.sm, marginBottom: theme.spacing.md }]}>
            <UserAvatar storedUrl={user.avatar_url} onPress={onAvatarPress} busy={avatarBusy} />

            <ProfileUserIdentity
              username={user.username}
              firstName={user.first_name}
              lastName={user.last_name}
              email={user.email}
              motto={user.motto}
              state={user.state}
              onMottoPress={() => router.push(routes.profileEditMotto as Href)}
              onStatePress={() => router.push(routes.profileEditState as Href)}
            />

            <UserProfileSummary statsSlot={statsSlot} />

            <Button
              title={`Appearance: ${THEME_LABELS[themeName]}`}
              variant="outline"
              fillParent
              onPress={() => router.push(routes.profileSettings as Href)}
              accessibilityHint="Opens theme and account settings"
            />
          </View>

          <ProfileScoringCollapsible ref={scoringRef} userId={user.id} />

          <UserDetectionGallerySection
            ref={galleryRef}
            userId={user.id}
            searchPlaceholder="Search your identifications…"
            deletable
            onDeleteItem={handleGalleryDelete}
            deletingId={deletingId}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            onOpenCategoryFilter={() => router.push(routes.profileGalleryFilter as Href)}
            onOpenDetection={openDetection}
          />
        </>
      ) : !loading && !error ? (
        <Text style={[styles.emptyHint, { color: theme.colors.textSecondary }]}>Sign in to load your profile.</Text>
      ) : null}

      <ThemedMessageModal
        visible={avatarPickError !== null}
        title="Profile photo"
        message={avatarPickError ?? ''}
        onDismiss={() => setAvatarPickError(null)}
      />
    </TabScreenWithLogout>
  );
}

const styles = StyleSheet.create({
  profileHero: {
    alignItems: 'center',
  },
  emptyHint: {
    textAlign: 'center',
    paddingVertical: 12,
  },
});
