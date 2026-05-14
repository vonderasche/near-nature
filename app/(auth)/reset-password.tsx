import { router } from 'expo-router';
import { useState } from 'react';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthField } from '@/components/auth/auth-field';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthScreenHeader } from '@/components/auth/auth-screen-header';
import { InlineFormError } from '@/components/screen/inline-form-error';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { useAuth } from '@/hooks/useAuth';
import { routes } from '@/lib/routing/routes';

type InfoDialog = { title: string; message: string; goToAppOnDismiss?: boolean } | null;

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<InfoDialog>(null);
  const { resetPassword, clearPasswordRecovery, error, clearError } = useAuth();

  function dismissInfo() {
    const go = info?.goToAppOnDismiss;
    setInfo(null);
    if (go) {
      router.replace(routes.tabs);
    }
  }

  async function onSubmit() {
    clearError();
    if (password.length < 8) {
      setInfo({ title: 'New password', message: 'Use at least 8 characters.' });
      return;
    }
    if (password !== confirm) {
      setInfo({ title: 'New password', message: 'Passwords do not match.' });
      return;
    }
    setBusy(true);
    try {
      await resetPassword(password);
      clearPasswordRecovery();
      setInfo({
        title: 'Password updated',
        message: 'You can continue using the app.',
        goToAppOnDismiss: true,
      });
    } catch (err: unknown) {
      setInfo({
        title: 'Reset password',
        message: err instanceof Error ? err.message : 'Something went wrong.',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen>
      <AuthScreenHeader title="Set new password" subtitle="Choose a password for your account." />

      <AuthField
        label="New password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 8 characters"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <AuthField
        label="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Repeat password"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />

      <AuthButton title="Update password" onPress={onSubmit} loading={busy} disabled={busy} />

      {error ? <InlineFormError>{error}</InlineFormError> : null}

      <ThemedMessageModal
        visible={info !== null}
        title={info?.title ?? ''}
        message={info?.message ?? ''}
        onDismiss={dismissInfo}
      />
    </AuthScreen>
  );
}
