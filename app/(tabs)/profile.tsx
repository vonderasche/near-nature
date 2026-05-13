import { useCallback, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, View } from 'react-native';

import { TabScreenWithLogout } from '@/components/TabScreenWithLogout';
import { ThemedText } from '@/components/themed-text';
import { CenteredActivityIndicator } from '@/components/profile/centered-activity-indicator';
import { DangerActionBlock } from '@/components/profile/danger-action-block';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { PlaceholderTileRow } from '@/components/profile/placeholder-tile-row';
import { ScreenSection } from '@/components/profile/screen-section';
import { UserAvatar } from '@/components/profile/user-avatar';
import { UserProfileSummary } from '@/components/profile/user-profile-summary';
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

  const { user, loading, deleting, error, refresh, remove } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

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
            hint="Your nature photos will appear here."
            hintColor={muted}>
            <PlaceholderTileRow count={GALLERY_PLACEHOLDER_COUNT} borderColor={border} iconColor={muted} />
          </ScreenSection>

          <DangerActionBlock
            title="Delete profile"
            onPress={confirmDeleteProfile}
            loading={deleting}
            disabled={deleting}
            hintColor={muted}
            hint="Calls the delete-account Edge Function: removes your auth user and, via the database, your public.users row."
          />
        </>
      ) : !loading && !error ? (
        <ThemedText style={[styles.emptyHint, { color: muted }]}>Sign in to load your profile.</ThemedText>
      ) : null}
    </TabScreenWithLogout>
  );
}

const styles = StyleSheet.create({
  profileHero: {
    alignItems: 'center',
  },
  emptyHint: {
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: authSpacing.sm,
  },
});
