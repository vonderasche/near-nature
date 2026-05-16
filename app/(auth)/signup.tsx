import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthDivider } from '@/components/auth/auth-divider';
import { AuthField } from '@/components/auth/auth-field';
import { AuthLinkRow } from '@/components/auth/auth-link-row';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthScreenHeader } from '@/components/auth/auth-screen-header';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { UsStatePicker } from '@/components/auth/us-state-picker';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { normalizeUsStateCode, type UsStateCode } from '@/constants/us-states';
import { patchUserStateForCurrentUser } from '@/lib/auth/patchUserState';
import { signUpWithEmail } from '@/lib/auth/email-auth';
import { routes } from '@/lib/routing/routes';
import type { GoogleSupabaseResult } from '@/lib/auth/google-supabase';

type InfoDialog = { title: string; message: string; goToLoginOnDismiss?: boolean } | null;

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [motto, setMotto] = useState('I like nature.');
  const [stateCode, setStateCode] = useState<UsStateCode | ''>('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<InfoDialog>(null);

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
    const state = normalizeUsStateCode(stateCode);
    if (!state) {
      setInfo({ title: 'Sign up', message: 'Select your US home state.' });
      return;
    }
    setBusy(true);
    try {
      const result = await signUpWithEmail(email, password, {
        username,
        first_name: firstName,
        last_name: lastName,
        motto,
        state,
      });
      if (!result.ok) {
        setInfo({ title: 'Sign up', message: result.message });
        return;
      }
      if (result.needsEmailConfirmation) {
        setInfo({
          title: 'Check your email',
          message:
            'If email confirmation is enabled in Supabase, you should receive a confirmation link. ' +
            'If nothing arrives after a few minutes, check spam, and in the Supabase dashboard under ' +
            'Authentication → Providers → Email confirm that SMTP / rate limits are OK. ' +
            'If confirmations are disabled, you can log in immediately after this screen.',
          goToLoginOnDismiss: true,
        });
        return;
      }
      // Session + profile: AuthGate routes to (tabs) or needs-profile.
    } finally {
      setBusy(false);
    }
  }

  const onGoogleFinished = useCallback(
    async (linked: GoogleSupabaseResult) => {
      const state = normalizeUsStateCode(stateCode);
      if (!state) {
        setInfo({ title: 'Google sign-up', message: 'Select your US home state before continuing with Google.' });
        return;
      }

      setBusy(true);
      try {
        if (!linked.ok) {
          setInfo({ title: 'Google sign-in', message: linked.message });
          return;
        }
        await patchUserStateForCurrentUser(state);
      } finally {
        setBusy(false);
      }
    },
    [stateCode],
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
      />
      <AuthField
        label="Last name"
        value={lastName}
        onChangeText={setLastName}
        placeholder="Family name"
        autoCapitalize="words"
      />
      <AuthField label="Short motto" value={motto} onChangeText={setMotto} placeholder="Shown on leaderboard" />

      <UsStatePicker value={stateCode} onChange={setStateCode} />

      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 6 characters"
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

      <AuthButton title="Create account" onPress={onSubmit} loading={busy} disabled={busy} />

      <AuthDivider />

      <GoogleSignInButton onFinished={onGoogleFinished} disabled={busy} />

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
