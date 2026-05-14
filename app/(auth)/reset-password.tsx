import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthField } from '@/components/auth/auth-field';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthScreenHeader } from '@/components/auth/auth-screen-header';
import { InlineFormError } from '@/components/screen/inline-form-error';
import { useAuth } from '@/hooks/useAuth';
import { routes } from '@/lib/routing/routes';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const { resetPassword, clearPasswordRecovery, error, clearError } = useAuth();

  async function onSubmit() {
    clearError();
    if (password.length < 8) {
      Alert.alert('New password', 'Use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('New password', 'Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await resetPassword(password);
      clearPasswordRecovery();
      Alert.alert('Password updated', 'You can continue using the app.', [
        { text: 'OK', onPress: () => router.replace(routes.tabs) },
      ]);
    } catch (err: unknown) {
      Alert.alert('Reset password', err instanceof Error ? err.message : 'Something went wrong.');
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
    </AuthScreen>
  );
}
