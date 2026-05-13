import type { ComponentProps, ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { authSpacing } from '@/constants/auth-theme';
import { useLogout } from '@/hooks/useLogout';

type TabScreenWithLogoutProps = {
  title: string;
  children?: ReactNode;
  refreshControl?: ComponentProps<typeof ScrollView>['refreshControl'];
};

export function TabScreenWithLogout({ title, children, refreshControl }: TabScreenWithLogoutProps) {
  const { logout, busy } = useLogout();
  const insets = useSafeAreaInsets();

  if (children) {
    return (
      <ThemedView style={styles.fill}>
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + authSpacing.md,
              paddingBottom: insets.bottom + authSpacing.lg,
              paddingHorizontal: authSpacing.md,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}>
          <ThemedText type="title">{title}</ThemedText>
          {children}
          <AuthButton
            title="Log out"
            variant="outline"
            onPress={logout}
            loading={busy}
            disabled={busy}
          />
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{title}</ThemedText>
      <AuthButton
        title="Log out"
        variant="outline"
        onPress={logout}
        loading={busy}
        disabled={busy}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  scrollContent: {
    gap: authSpacing.lg,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: authSpacing.lg,
  },
});
