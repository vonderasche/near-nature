import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { TabScreenWithLogout } from '@/components/TabScreenWithLogout';
import { CenteredActivityIndicator } from '@/components/profile/centered-activity-indicator';
import { ProfileOverflowMenu } from '@/components/profile/profile-overflow-menu';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { DetectionGalleryGrid } from '@/components/profile/detection-gallery-grid';
import { MottoEditModal } from '@/components/profile/motto-edit-modal';
import { StateEditModal } from '@/components/profile/state-edit-modal';
import { ProfileStatStrip } from '@/components/profile/profile-stat-strip';
import { profileStatStripPropsFromPublicProfile } from '@/components/profile/profile-stats-from-public-profile';
import { ScreenSection } from '@/components/profile/screen-section';
import { UserAvatar } from '@/components/profile/user-avatar';
import { UserProfileSummary } from '@/components/profile/user-profile-summary';
import { ThemedConfirmModal, ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { authSpacing, authTypography } from '@/constants/auth-theme';
import { Colors } from '@/constants/theme';
import { useAvatarFromGallery } from '@/hooks/useAvatarFromGallery';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDeleteDetection } from '@/hooks/useDeleteDetection';
import { useMottoSave } from '@/hooks/useMottoSave';
import { useStateSave } from '@/hooks/useStateSave';
import { useUserDetectionGallery } from '@/hooks/useUserDetectionGallery';
import { useUser } from '@/hooks/useUser';
import { getPublicUserProfile, type PublicUserProfile } from '@/services/userService';
import type { DetectionGalleryItem } from '@/types';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const muted = Colors[colorScheme].icon;
  const border = Colors[colorScheme].tabIconDefault;
  const tint = Colors[colorScheme].tint;

  const { user, loading, deleting, error, refresh, update, remove: deleteAccount } = useUser();
  const { saveMotto, saving: mottoSaving } = useMottoSave(update);
  const { saveState, saving: stateSaving } = useStateSave(update);
  const { deleteById, deletingId } = useDeleteDetection();
  const {
    items: galleryItems,
    isLoading: galleryLoading,
    error: galleryError,
    refetch: refetchGallery,
  } = useUserDetectionGallery({ userId: user?.id, limit: 24 });
  const [refreshing, setRefreshing] = useState(false);
  const [mottoModalVisible, setMottoModalVisible] = useState(false);
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [avatarPickError, setAvatarPickError] = useState<string | null>(null);
  const [deleteProfileOpen, setDeleteProfileOpen] = useState(false);
  const [deleteProfileError, setDeleteProfileError] = useState<string | null>(null);
  const [statsProfile, setStatsProfile] = useState<PublicUserProfile | null>(null);

  const { pickAndSetAvatar, busy: avatarBusy } = useAvatarFromGallery(user?.id, update);

  useEffect(() => {
    if (!user?.id) {
      setStatsProfile(null);
      return;
    }
    let cancelled = false;
    void getPublicUserProfile(user.id).then((row) => {
      if (!cancelled) setStatsProfile(row);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const onAvatarPress = useCallback(() => {
    setAvatarPickError(null);
    void (async () => {
      const r = await pickAndSetAvatar();
      if (r.ok) return;
      if ('canceled' in r && r.canceled) return;
      setAvatarPickError('message' in r ? r.message : 'Something went wrong.');
    })();
  }, [pickAndSetAvatar]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const statsPromise = user?.id ? getPublicUserProfile(user.id) : Promise.resolve(null);
      const [, , stats] = await Promise.all([refresh(), refetchGallery(), statsPromise]);
      setStatsProfile(stats);
    } finally {
      setRefreshing(false);
    }
  }, [refresh, refetchGallery, user?.id]);

  const handleGalleryDelete = useCallback(
    async (item: DetectionGalleryItem) => {
      const r = await deleteById(item.id);
      if (r.ok) {
        await refetchGallery();
        if (user?.id) {
          const row = await getPublicUserProfile(user.id);
          setStatsProfile(row);
        }
      }
      return r;
    },
    [deleteById, refetchGallery, user?.id],
  );

  const confirmDeleteProfile = useCallback(() => {
    setDeleteProfileOpen(true);
  }, []);

  const runDeleteProfile = useCallback(async () => {
    const result = await deleteAccount();
    setDeleteProfileOpen(false);
    if (!result.ok) {
      setDeleteProfileError(result.message);
    }
  }, [deleteAccount]);

  return (
    <TabScreenWithLogout
      title="Profile"
      hideLogout={Boolean(user)}
      titleAccessory={
        user ? (
          <ProfileOverflowMenu onDeleteProfile={confirmDeleteProfile} deleteBusy={deleting} />
        ) : undefined
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tint}
          colors={[tint]}
        />
      }>
      {loading && !user ? (
        <CenteredActivityIndicator color={tint} accessibilityLabel="Loading profile" />
      ) : null}

      {error ? (
        <ErrorRetryBlock
          message={error}
          onRetry={() => void refresh()}
          borderColor={border}
          retryLabel="Try again"
        />
      ) : null}

      {user ? (
        <>
          <View style={styles.profileHero}>
            <UserAvatar
              storedUrl={user.avatar_url}
              mutedIconColor={muted}
              borderColor={border}
              onPress={onAvatarPress}
              busy={avatarBusy}
            />

            {statsProfile ? (
              <ProfileStatStrip {...profileStatStripPropsFromPublicProfile(statsProfile, muted, tint)} />
            ) : null}

            <UserProfileSummary
              firstName={user.first_name}
              lastName={user.last_name}
              email={user.email}
              username={user.username}
              motto={user.motto}
              state={user.state}
              mutedColor={muted}
              onMottoPress={() => setMottoModalVisible(true)}
              onStatePress={() => setStateModalVisible(true)}
            />
            <MottoEditModal
              visible={mottoModalVisible}
              initialMotto={user.motto}
              onClose={() => setMottoModalVisible(false)}
              onSave={saveMotto}
              saving={mottoSaving}
            />
            <StateEditModal
              visible={stateModalVisible}
              initialState={user.state}
              onClose={() => setStateModalVisible(false)}
              onSave={saveState}
              saving={stateSaving}
            />
          </View>

          <ScreenSection
            title="Gallery"
            hint="Grouped by native and non-native. Long-press a tile to delete."
            hintColor={muted}>
            <DetectionGalleryGrid
              items={galleryItems}
              loading={galleryLoading}
              error={galleryError}
              onRetry={() => void refetchGallery()}
              borderColor={border}
              mutedColor={muted}
              activityColor={tint}
              deletable
              onDeleteItem={handleGalleryDelete}
              deletingId={deletingId}
            />
          </ScreenSection>
        </>
      ) : !loading && !error ? (
        <Text style={[styles.emptyHint, { color: muted }]}>Sign in to load your profile.</Text>
      ) : null}
      <ThemedMessageModal
        visible={avatarPickError !== null}
        title="Profile photo"
        message={avatarPickError ?? ''}
        onDismiss={() => setAvatarPickError(null)}
      />
      <ThemedConfirmModal
        visible={deleteProfileOpen}
        title="Delete profile"
        message="This permanently deletes your account and profile data. You cannot undo this."
        confirmLabel="Delete profile"
        onCancel={() => setDeleteProfileOpen(false)}
        onConfirm={runDeleteProfile}
        confirmLoading={deleting}
      />
      <ThemedMessageModal
        visible={deleteProfileError !== null}
        title="Could not delete profile"
        message={deleteProfileError ?? ''}
        onDismiss={() => setDeleteProfileError(null)}
      />
    </TabScreenWithLogout>
  );
}

const styles = StyleSheet.create({
  profileHero: {
    alignItems: 'center',
  },
  emptyHint: {
    ...authTypography.subtitle,
    textAlign: 'center',
    paddingVertical: authSpacing.sm,
  },
});
