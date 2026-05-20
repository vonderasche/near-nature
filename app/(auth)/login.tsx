import { useState } from 'react';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthField } from '@/components/auth/auth-field';
import { AuthLinkRow } from '@/components/auth/auth-link-row';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthScreenHeader } from '@/components/auth/auth-screen-header';
import { AuthTextLink } from '@/components/auth/auth-text-link';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { authSpacing } from '@/constants/auth-theme';
import { signInWithEmail } from '@/lib/auth/email-auth';
import { routes } from '@/lib/routing/routes';

type InfoDialog = { title: string; message: string } | null;

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<InfoDialog>(null);

  async function onSubmit() {
    setBusy(true);
    try {
      const result = await signInWithEmail(identifier, password);
      if (!result.ok) {
        setInfo({ title: 'Sign in', message: result.message });
        return;
      }
      // Navigation: AuthGate sends you to (tabs) or needs-profile once session + profile are resolved.
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen>
      <AuthScreenHeader title="Log in" subtitle="Use your email or username." />

      <AuthField
        label="Email or username"
        value={identifier}
        onChangeText={setIdentifier}
        placeholder="you@example.com or nature_fan"
        autoCapitalize="none"
        autoComplete="username"
        textContentType="username"
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        autoComplete="password"
        textContentType="password"
      />

      <AuthButton title="Sign in" onPress={onSubmit} loading={busy} disabled={busy} />

      <AuthTextLink href={routes.forgotPassword} variant="muted" style={{ marginTop: authSpacing.sm }}>
        Forgot password?
      </AuthTextLink>

      <AuthLinkRow prompt="No account?" href={routes.signup} linkText="Create one" />

      <AuthLinkRow
        prompt="Just browsing?"
        href={routes.explorerBoardTab}
        linkText="View Explorer Board"
      />

      <ThemedMessageModal
        visible={info !== null}
        title={info?.title ?? ''}
        message={info?.message ?? ''}
        onDismiss={() => setInfo(null)}
      />
    </AuthScreen>
  );
}
