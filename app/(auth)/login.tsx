import { useState } from 'react';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthField } from '@/components/auth/auth-field';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { AuthLinkRow } from '@/components/auth/auth-link-row';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthScreenHeader } from '@/components/auth/auth-screen-header';
import { AuthTextLink } from '@/components/auth/auth-text-link';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { authSpacing } from '@/constants/auth-theme';
import { usePostSignInNavigation } from '@/hooks/usePostSignInNavigation';
import { signInWithEmail } from '@/lib/auth/email-auth';
import { routes } from '@/lib/routing/routes';
import { signInWithGoogle } from '@/services/authService';

type InfoDialog = { title: string; message: string } | null;

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [signInPending, setSignInPending] = useState(false);
  const [info, setInfo] = useState<InfoDialog>(null);
  const { completingSignIn, buttonTitle } = usePostSignInNavigation(signInPending, {
    idle: 'Sign in',
    completing: 'Signing you in…',
  });

  const signingIn = busy || completingSignIn;

  async function onSubmit() {
    setBusy(true);
    try {
      const result = await signInWithEmail(identifier, password);
      if (!result.ok) {
        setInfo({ title: 'Sign in', message: result.message });
        return;
      }
      setSignInPending(true);
    } finally {
      setBusy(false);
    }
  }

  async function onGoogleSignIn() {
    setGoogleBusy(true);
    try {
      await signInWithGoogle();
      setSignInPending(true);
    } catch (error) {
      setInfo({
        title: 'Google sign-in',
        message: error instanceof Error ? error.message : 'Could not sign in with Google.',
      });
    } finally {
      setGoogleBusy(false);
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

      <AuthButton
        title={buttonTitle}
        onPress={onSubmit}
        loading={signingIn}
        disabled={signingIn || googleBusy}
      />
      <GoogleSignInButton
        onPress={onGoogleSignIn}
        loading={googleBusy || completingSignIn}
        disabled={signingIn || googleBusy}
      />

      <AuthTextLink href={routes.forgotPassword} variant="muted" style={{ marginTop: authSpacing.sm }}>
        Forgot password?
      </AuthTextLink>

      <AuthLinkRow prompt="No account?" href={routes.signup} linkText="Create one" />

      <AuthLinkRow
        prompt="Just browsing?"
        href={routes.explorerBoardTab}
        linkText="View Rankings"
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
