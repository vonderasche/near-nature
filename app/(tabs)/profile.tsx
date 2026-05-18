import { useCallback, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { TabScreenWithLogout } from '@/components/layout/tab-screen-with-logout';
import {
  ProfileScoringCollapsible,
  type ProfileScoringCollapsibleHandle,
} from '@/components/profile/profile-scoring-collapsible';
import { CenteredActivityIndicator } from '@/components/profile/centered-activity-indicator';
import { ProfileOverflowMenu } from '@/components/profile/profile-overflow-menu';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import {
  UserDetectionGallerySection,
  type UserDetectionGallerySectionHandle,
} from '@/components/profile/user-detection-gallery-section';
import { MottoEditModal } from '@/components/profile/motto-edit-modal';
import { StateEditModal } from '@/components/profile/state-edit-modal';
import { ProfileStatStrip } from '@/components/profile/profile-stat-strip';
import { profileStatStripPropsFromPublicProfile } from '@/lib/profile/profileStatStripFromPublicProfile';
import { ProfileUserIdentity } from '@/components/profile/profile-user-identity';
import { UserAvatar } from '@/components/profile/user-avatar';
import { UserProfileSummary } from '@/components/profile/user-profile-summary';
import { ThemedConfirmModal, ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useAvatarFromGallery } from '@/hooks/useAvatarFromGallery';
import { useDeleteDetection } from '@/hooks/useDeleteDetection';
import { useMottoSave } from '@/hooks/useMottoSave';
import { useStateSave } from '@/hooks/useStateSave';
import { useUser } from '@/hooks/useUser';
import { requestExplorerBoardRefresh } from '@/lib/explorerBoard/explorerBoardRefresh';
import type { DetectionGalleryItem } from '@/types';

export default function ProfileScreen() {
  const {
    user,
    stats,
    loading,
    refreshing: profileRefreshing,
    deleting,
    error,
    refresh,
    update,
    remove: deleteAccount,
  } = useUser();
  const { saveMotto, saving: mottoSaving } = useMottoSave(update);
  const { saveState, saving: stateSaving } = useStateSave(update);
  const { deleteById, deletingId } = useDeleteDetection();
  const galleryRef = useRef<UserDetectionGallerySectionHandle>(null);
  const scoringRef = useRef<ProfileScoringCollapsibleHandle>(null);
  const [mottoModalVisible, setMottoModalVisible] = useState(false);
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [avatarPickError, setAvatarPickError] = useState<string | null>(null);
  const [deleteProfileOpen, setDeleteProfileOpen] = useState(false);
  const [deleteProfileError, setDeleteProfileError] = useState<string | null>(null);
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
      await Promise.all([refresh(), galleryPromise, scoringPromise]);
    } finally {
      setPullRefreshing(false);
    }
  }, [refresh]);

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

  const statsSlot = stats ? (
    <ProfileStatStrip
      {...profileStatStripPropsFromPublicProfile(stats, authColors.textMuted, authColors.text)}
    />
  ) : null;

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
          refreshing={pullRefreshing || profileRefreshing}
          onRefresh={onRefresh}
          tintColor={authColors.text}
          colors={[authColors.text]}
        />
      }>
      {loading && !user ? (
        <CenteredActivityIndicator color={authColors.text} accessibilityLabel="Loading profile" />
      ) : null}

      {error ? (
        <ErrorRetryBlock
          message={error}
          onRetry={() => void refresh()}
          borderColor={authColors.border}
          retryLabel="Try again"
        />
      ) : null}

      {user ? (
        <>
          <View style={styles.profileHero}>
            <UserAvatar
              storedUrl={user.avatar_url}
              mutedIconColor={authColors.textMuted}
              borderColor={authColors.border}
              onPress={onAvatarPress}
              busy={avatarBusy}
            />

            <ProfileUserIdentity
              username={user.username}
              firstName={user.first_name}
              lastName={user.last_name}
              email={user.email}
              motto={user.motto}
              state={user.state}
              mutedColor={authColors.textMuted}
              onMottoPress={() => setMottoModalVisible(true)}
              onStatePress={() => setStateModalVisible(true)}
            />

            <UserProfileSummary statsSlot={statsSlot} />
          </View>

          <ProfileScoringCollapsible
            ref={scoringRef}
            userId={user.id}
            borderColor={authColors.border}
            mutedColor={authColors.textMuted}
          />

          <UserDetectionGallerySection
            ref={galleryRef}
            userId={user.id}
            searchPlaceholder="Search your identifications…"
            borderColor={authColors.border}
            mutedColor={authColors.textMuted}
            activityColor={authColors.text}
            deletable
            onDeleteItem={handleGalleryDelete}
            deletingId={deletingId}
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
        </>
      ) : !loading && !error ? (
        <Text style={styles.emptyHint}>Sign in to load your profile.</Text>
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
    gap: authSpacing.sm,
    marginBottom: authSpacing.md,
  },
  emptyHint: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    textAlign: 'center',
    paddingVertical: authSpacing.sm,
  },
});
