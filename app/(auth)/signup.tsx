import type { AuthSessionResult } from 'expo-auth-session';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthDivider } from '@/components/auth/auth-divider';
import { AuthField } from '@/components/auth/auth-field';
import { AuthLinkRow } from '@/components/auth/auth-link-row';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthScreenHeader } from '@/components/auth/auth-screen-header';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { signUpWithEmail } from '@/lib/auth/email-auth';
import { signInWithGoogleAuthResult } from '@/lib/auth/google-supabase';
import { routes } from '@/lib/routing/routes';

type InfoDialog = { title: string; message: string; goToLoginOnDismiss?: boolean } | null;

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [motto, setMotto] = useState('I like nature.');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<InfoDialog>(null);

  const goToApp = useCallback(() => {
    router.replace(routes.tabs);
  }, []);

  function dismissInfo() {
    const goLogin = info?.goToLoginOnDismiss;
    setInfo(null);
    if (goLogin) {
      router.replace(routes.login);
    }
  }

  async function onSubmit() {
    if (password !== confirm) {
      setInfo({ title: 'Sign up', message: 'Passwords do not match.' });
      return;
    }
    setBusy(true);
    try {
      const result = await signUpWithEmail(email, password, {
        username,
        first_name: firstName,
        last_name: lastName,
        motto,
      });
      if (!result.ok) {
        setInfo({ title: 'Sign up', message: result.message });
        return;
      }
      if (result.needsEmailConfirmation) {
        setInfo({
          title: 'Check your email',
          message: 'We sent you a confirmation link. After you confirm, you can log in.',
          goToLoginOnDismiss: true,
        });
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
      <AuthScreenHeader title="Create account" subtitle="Email and password, or Google." />

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
        label="Username"
        value={username}
        onChangeText={setUsername}
        placeholder="Unique handle"
        autoComplete="off"
      />
      <AuthField
        label="First name"
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Given name"
        autoCapitalize="words"
        autoComplete="off"
      />
      <AuthField
        label="Last name"
        value={lastName}
        onChangeText={setLastName}
        placeholder="Family name"
        autoCapitalize="words"
        autoComplete="off"
      />
      <AuthField
        label="Motto"
        value={motto}
        onChangeText={setMotto}
        placeholder="A short line about you and nature"
        autoCapitalize="sentences"
        autoComplete="off"
      />
      <AuthField
        label="Password"
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

      <AuthButton title="Sign up" onPress={onSubmit} loading={busy} disabled={busy} />

      <AuthDivider />

      <GoogleSignInButton onSuccess={onGoogleSuccess} />

      <AuthLinkRow prompt="Already have an account?" href={routes.login} linkText="Log in" />

      <ThemedMessageModal
        visible={info !== null}
        title={info?.title ?? ''}
        message={info?.message ?? ''}
        onDismiss={dismissInfo}
      />
    </AuthScreen>
  );
}
