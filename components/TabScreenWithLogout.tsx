import { StyleSheet } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { authSpacing } from '@/constants/auth-theme';
import { useLogout } from '@/hooks/useLogout';

type TabScreenWithLogoutProps = {
  title: string;
};

export function TabScreenWithLogout({ title }: TabScreenWithLogoutProps) {
  const { logout, busy } = useLogout();

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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: authSpacing.lg,
  },
});
