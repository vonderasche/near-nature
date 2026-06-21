import type { ComponentProps, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { ScreenHeading } from '@/components/shared/screen-heading';
import { SubtleRefreshIndicator } from '@/components/layout/subtle-refresh-indicator';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { useLogout } from '@/hooks/useLogout';
import { useTheme } from '@/hooks/useTheme';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';

type TabScreenWithLogoutProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  refreshControl?: ComponentProps<typeof ScrollView>['refreshControl'];
  /** Small header spinner while cached data is revalidated in the background. */
  backgroundRefreshing?: boolean;
  /** When true, the default “Log out” button is omitted (e.g. profile uses an overflow menu). */
  hideLogout?: boolean;
  /** Rendered on the title row (e.g. profile hamburger menu). */
  titleAccessory?: ReactNode;
};

export function TabScreenWithLogout({
  title,
  subtitle,
  children,
  refreshControl,
  backgroundRefreshing = false,
  hideLogout = false,
  titleAccessory,
}: TabScreenWithLogoutProps) {
  const { theme } = useTheme();
  const { logout, busy, logoutError, clearLogoutError } = useLogout();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const edge = contentInsetsPadding(insets);

  const headingBlock = titleAccessory ? (
    <View style={[styles.titleRow, { gap: theme.spacing.sm, marginBottom: theme.spacing.md }]}>
      <View style={styles.titleText}>
        <View style={[styles.titleWithIndicator, { gap: theme.spacing.sm }]}>
          <ScreenHeading title={title} subtitle={subtitle} marginBottom={0} />
          <SubtleRefreshIndicator visible={backgroundRefreshing} />
        </View>
      </View>
      {titleAccessory}
    </View>
  ) : (
    <View
      style={[
        styles.titleWithIndicatorStandalone,
        { gap: theme.spacing.sm, marginBottom: theme.spacing.md },
      ]}>
      <ScreenHeading title={title} subtitle={subtitle} marginBottom={0} />
      <SubtleRefreshIndicator visible={backgroundRefreshing} />
    </View>
  );

  const logoutErrorModal = (
    <ThemedMessageModal
      visible={logoutError !== null}
      title="Log out"
      message={logoutError ?? ''}
      onDismiss={clearLogoutError}
    />
  );

  const shellStyle = { backgroundColor: theme.colors.background };

  if (children) {
    return (
      <View style={[styles.fill, shellStyle]}>
        <ScrollView
          style={[styles.fill, shellStyle]}
          contentContainerStyle={[
            styles.scrollContent,
            {
              gap: theme.spacing.lg,
              paddingTop: edge.paddingTop,
              paddingBottom: edge.paddingBottom + theme.spacing.xl + tabBarHeight,
              paddingHorizontal: theme.spacing.lg,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}>
          {headingBlock}
          {children}
          {!hideLogout ? (
            <AuthButton
              title="Log out"
              variant="outline"
              onPress={logout}
              loading={busy}
              disabled={busy}
            />
          ) : null}
        </ScrollView>
        {logoutErrorModal}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.fill,
        styles.centeredShell,
        shellStyle,
        {
          gap: theme.spacing.lg,
          paddingTop: edge.paddingTop,
          paddingBottom: edge.paddingBottom + tabBarHeight,
          paddingHorizontal: theme.spacing.lg,
        },
      ]}>
      {titleAccessory ? (
        <View style={[styles.titleRow, { width: '100%', gap: theme.spacing.sm }]}>
          <View style={styles.titleText}>
            <ScreenHeading title={title} subtitle={subtitle} marginBottom={0} />
          </View>
          {titleAccessory}
        </View>
      ) : (
        <ScreenHeading title={title} subtitle={subtitle} marginBottom={theme.spacing.md} />
      )}
      {!hideLogout ? (
        <AuthButton
          title="Log out"
          variant="outline"
          onPress={logout}
          loading={busy}
          disabled={busy}
        />
      ) : null}
      {logoutErrorModal}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  scrollContent: {},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleText: {
    flex: 1,
    minWidth: 0,
  },
  titleWithIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  titleWithIndicatorStandalone: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  centeredShell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
