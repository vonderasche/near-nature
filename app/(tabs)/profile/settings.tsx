import { ScrollView, View } from 'react-native';
import { useCallback, useState } from 'react';

import { Section } from '@/components/ui/Section';
import { Screen } from '@/components/ui/Screen';
import { StackScreenHeader } from '@/components/ui/StackScreenHeader';
import { Button } from '@/components/ui/Button';
import { ThemePicker } from '@/components/settings/theme-picker';
import { ThemedConfirmModal, ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { useTheme } from '@/hooks/useTheme';
import { useLogout } from '@/hooks/useLogout';
import { useUser } from '@/hooks/useUser';

export default function ProfileSettingsScreen() {
  const { theme } = useTheme();
  const { logout, busy: logoutBusy, logoutError, clearLogoutError } = useLogout();
  const { remove: deleteAccount, deleting } = useUser();
  const [deleteProfileOpen, setDeleteProfileOpen] = useState(false);
  const [deleteProfileError, setDeleteProfileError] = useState<string | null>(null);

  const runDeleteProfile = useCallback(async () => {
    const result = await deleteAccount();
    setDeleteProfileOpen(false);
    if (!result.ok) {
      setDeleteProfileError(result.message);
    }
  }, [deleteAccount]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}>
        <StackScreenHeader title="Settings" subtitle="Account & appearance" />

        <Section title="Appearance">
          <ThemePicker />
        </Section>

        <Section title="Account">
          <View style={{ gap: theme.spacing.sm }}>
            <Button
              title="Log out"
              variant="outline"
              fillParent
              onPress={() => void logout()}
              loading={logoutBusy}
              disabled={logoutBusy || deleting}
            />
            <Button
              title="Delete profile…"
              variant="destructive"
              fillParent
              onPress={() => setDeleteProfileOpen(true)}
              disabled={logoutBusy || deleting}
            />
          </View>
        </Section>
      </ScrollView>

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
      <ThemedMessageModal
        visible={logoutError !== null}
        title="Log out"
        message={logoutError ?? ''}
        onDismiss={clearLogoutError}
      />
    </Screen>
  );
}
