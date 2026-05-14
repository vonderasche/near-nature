import type { AuthSessionResult } from 'expo-auth-session';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthDivider } from '@/components/auth/auth-divider';
import { AuthField } from '@/components/auth/auth-field';
import { AuthLinkRow } from '@/components/auth/auth-link-row';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthScreenHeader } from '@/components/auth/auth-screen-header';
import { AuthTextLink } from '@/components/auth/auth-text-link';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { authSpacing } from '@/constants/auth-theme';
import { signInWithEmail } from '@/lib/auth/email-auth';
import { signInWithGoogleAuthResult } from '@/lib/auth/google-supabase';
import { routes } from '@/lib/routing/routes';

type InfoDialog = { title: string; message: string } | null;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<InfoDialog>(null);

  const goToApp = useCallback(() => {
    router.replace(routes.tabs);
  }, []);

  async function onSubmit() {
    setBusy(true);
    try {
      const result = await signInWithEmail(email, password);
      if (!result.ok) {
        setInfo({ title: 'Sign in', message: result.message });
        return;
      }
      goToApp();
    } finally {
      setBusy(false);
    }
  }

  const onGoogleSuccess = useCallback(
    async (sessionResult: AuthSessionResult) => {
      setBusy(true);
      try {
        const linked = await signInWithGoogleAuthResult(sessionResult);
        if (!linked.ok) {
          setInfo({ title: 'Google sign-in', message: linked.message });
          return;
        }
        goToApp();
      } finally {
        setBusy(false);
      }
    },
    [goToApp]
  );

  return (
    <AuthScreen>
      <AuthScreenHeader title="Log in" subtitle="Use your email or Google." />

      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
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

      <AuthDivider />

      <GoogleSignInButton onSuccess={onGoogleSuccess} />

      <AuthLinkRow prompt="No account?" href={routes.signup} linkText="Create one" />

      <ThemedMessageModal
        visible={info !== null}
        title={info?.title ?? ''}
        message={info?.message ?? ''}
        onDismiss={() => setInfo(null)}
      />
    </AuthScreen>
  );
}
