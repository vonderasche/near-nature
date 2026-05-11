import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { AuthButton } from '@/components/auth/auth-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { authSpacing } from '@/constants/auth-theme';
import { useAuth } from '@/hooks/useAuth';

export default function HomeScreen() {
  const [busy, setBusy] = useState(false);
  const { logout } = useAuth();

  async function onLogout() {
    setBusy(true);
    try {
      await logout();
    } catch (err: unknown) {
      Alert.alert('Log out', err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Home</ThemedText>
      <AuthButton
        title="Log out"
        variant="outline"
        onPress={onLogout}
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
