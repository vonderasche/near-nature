import { useState } from 'react';
import { Alert } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthField } from '@/components/auth/auth-field';
import { AuthLinkRow } from '@/components/auth/auth-link-row';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthScreenHeader } from '@/components/auth/auth-screen-header';
import { InlineFormError } from '@/components/screen/inline-form-error';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const { forgotPassword, error, clearError } = useAuth();

  async function onSubmit() {
    clearError();
    const e = email.trim();
    if (!e) {
      Alert.alert('Reset password', 'Enter your email.');
      return;
    }
    setBusy(true);
    try {
      await forgotPassword(e);
      Alert.alert(
        'Check your email',
        'If an account exists for that address, we sent a link to reset your password.'
      );
    } catch (err: unknown) {
      Alert.alert('Reset password', err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen>
      <AuthScreenHeader title="Forgot password" subtitle="We will email you a reset link." />

      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
      />

      <AuthButton title="Send reset link" onPress={onSubmit} loading={busy} disabled={busy} />

      {error ? <InlineFormError>{error}</InlineFormError> : null}

      <AuthLinkRow href="/login" linkText="Back to log in" />
    </AuthScreen>
  );
}
