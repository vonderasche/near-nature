import { useState } from 'react';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthField } from '@/components/auth/auth-field';
import { AuthLinkRow } from '@/components/auth/auth-link-row';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthScreenHeader } from '@/components/auth/auth-screen-header';
import { InlineFormError } from '@/components/screen/inline-form-error';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { useAuth } from '@/hooks/useAuth';
import { routes } from '@/lib/routing/routes';

type InfoDialog = { title: string; message: string } | null;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<InfoDialog>(null);
  const { forgotPassword, error, clearError } = useAuth();

  async function onSubmit() {
    clearError();
    const e = email.trim();
    if (!e) {
      setInfo({ title: 'Reset password', message: 'Enter your email.' });
      return;
    }
    setBusy(true);
    try {
      await forgotPassword(e);
      setInfo({
        title: 'Check your email',
        message: 'If an account exists for that address, we sent a link to reset your password.',
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

      <AuthLinkRow href={routes.login} linkText="Back to log in" />

      <ThemedMessageModal
        visible={info !== null}
        title={info?.title ?? ''}
        message={info?.message ?? ''}
        onDismiss={() => setInfo(null)}
      />
    </AuthScreen>
  );
}
