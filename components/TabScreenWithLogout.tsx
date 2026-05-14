import type { ComponentProps, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { ScreenHeading } from '@/components/screen/screen-heading';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { authColors, authSpacing } from '@/constants/auth-theme';
import { useLogout } from '@/hooks/useLogout';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';

type TabScreenWithLogoutProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  refreshControl?: ComponentProps<typeof ScrollView>['refreshControl'];
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
  hideLogout = false,
  titleAccessory,
}: TabScreenWithLogoutProps) {
  const { logout, busy, logoutError, clearLogoutError } = useLogout();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const edge = contentInsetsPadding(insets);

  const headingBlock = titleAccessory ? (
    <View style={styles.titleRow}>
      <View style={styles.titleText}>
        <ScreenHeading title={title} subtitle={subtitle} marginBottom={0} />
      </View>
      {titleAccessory}
    </View>
  ) : (
    <ScreenHeading title={title} subtitle={subtitle} marginBottom={authSpacing.md} />
  );

  const logoutErrorModal = (
    <ThemedMessageModal
      visible={logoutError !== null}
      title="Log out"
      message={logoutError ?? ''}
      onDismiss={clearLogoutError}
    />
  );

  if (children) {
    return (
      <View style={styles.fill}>
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: edge.paddingTop,
              paddingBottom: edge.paddingBottom + authSpacing.xl + tabBarHeight,
              paddingHorizontal: authSpacing.lg,
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
        {
          paddingTop: edge.paddingTop,
          paddingBottom: edge.paddingBottom + tabBarHeight,
          paddingHorizontal: authSpacing.lg,
        },
      ]}>
      {titleAccessory ? (
        <View style={[styles.titleRow, { width: '100%' }]}>
          <View style={styles.titleText}>
            <ScreenHeading title={title} subtitle={subtitle} marginBottom={0} />
          </View>
          {titleAccessory}
        </View>
      ) : (
        <ScreenHeading title={title} subtitle={subtitle} marginBottom={authSpacing.md} />
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
    backgroundColor: authColors.background,
  },
  scrollContent: {
    gap: authSpacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: authSpacing.sm,
    marginBottom: authSpacing.md,
  },
  titleText: {
    flex: 1,
    minWidth: 0,
  },
  centeredShell: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: authSpacing.lg,
  },
});
