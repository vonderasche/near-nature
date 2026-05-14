import type { ComponentProps, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { ScreenHeading } from '@/components/screen/screen-heading';
import { authColors, authSpacing } from '@/constants/auth-theme';
import { useLogout } from '@/hooks/useLogout';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';

type TabScreenWithLogoutProps = {
  title: string;
  children?: ReactNode;
  refreshControl?: ComponentProps<typeof ScrollView>['refreshControl'];
};

export function TabScreenWithLogout({ title, children, refreshControl }: TabScreenWithLogoutProps) {
  const { logout, busy } = useLogout();
  const insets = useSafeAreaInsets();
  const edge = contentInsetsPadding(insets);

  if (children) {
    return (
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
          refreshControl={refreshControl}>
          <ScreenHeading title={title} marginBottom={authSpacing.md} />
          {children}
          <AuthButton
            title="Log out"
            variant="outline"
            onPress={logout}
            loading={busy}
            disabled={busy}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.fill, styles.centeredShell, edge, { paddingHorizontal: authSpacing.lg }]}>
      <ScreenHeading title={title} marginBottom={authSpacing.md} />
      <AuthButton
        title="Log out"
        variant="outline"
        onPress={logout}
        loading={busy}
        disabled={busy}
      />
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
  centeredShell: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: authSpacing.lg,
  },
});
