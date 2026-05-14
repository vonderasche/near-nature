import { useCallback, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { TabScreenWithLogout } from '@/components/TabScreenWithLogout';
import { CenteredActivityIndicator } from '@/components/profile/centered-activity-indicator';
import { ProfileOverflowMenu } from '@/components/profile/profile-overflow-menu';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { DetectionGalleryRow } from '@/components/profile/detection-gallery-row';
import { ScreenSection } from '@/components/profile/screen-section';
import { UserAvatar } from '@/components/profile/user-avatar';
import { UserProfileSummary } from '@/components/profile/user-profile-summary';
import { Colors } from '@/constants/theme';
import { authSpacing, authTypography } from '@/constants/auth-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserDetectionGallery } from '@/hooks/useUserDetectionGallery';
import { useUser } from '@/hooks/useUser';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const muted = Colors[colorScheme].icon;
  const border = Colors[colorScheme].tabIconDefault;
  const tint = Colors[colorScheme].tint;

  const { user, loading, deleting, error, refresh, remove } = useUser();
  const {
    items: galleryItems,
    isLoading: galleryLoading,
    error: galleryError,
    refetch: refetchGallery,
  } = useUserDetectionGallery({ userId: user?.id, limit: 24 });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refresh(), refetchGallery()]);
    } finally {
      setRefreshing(false);
    }
  }, [refresh, refetchGallery]);

  const confirmDeleteProfile = useCallback(() => {
    Alert.alert(
      'Delete profile',
      'This permanently deletes your account and profile data. You cannot undo this.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete profile',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              const result = await remove();
              if (!result.ok) {
                Alert.alert('Could not delete profile', result.message);
              }
            })();
          },
        },
      ]
    );
  }, [remove]);

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
            <UserAvatar imageUri={user.avatar_url} mutedIconColor={muted} borderColor={border} />

            <UserProfileSummary
              firstName={user.first_name}
              lastName={user.last_name}
              email={user.email}
              username={user.username}
              motto={user.motto}
              mutedColor={muted}
            />
          </View>

          <ScreenSection
            title="Gallery"
            hint="Photos from identifications you saved to your account."
            hintColor={muted}>
            <DetectionGalleryRow
              items={galleryItems}
              loading={galleryLoading}
              error={galleryError}
              onRetry={() => void refetchGallery()}
              borderColor={border}
              mutedColor={muted}
              activityColor={tint}
            />
          </ScreenSection>
        </>
      ) : !loading && !error ? (
        <Text style={[styles.emptyHint, { color: muted }]}>Sign in to load your profile.</Text>
      ) : null}
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
