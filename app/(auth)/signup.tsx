import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import type { AuthSessionResult } from 'expo-auth-session';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthDivider } from '@/components/auth/auth-divider';
import { AuthField } from '@/components/auth/auth-field';
import { AuthScreen } from '@/components/auth/auth-screen';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { signUpWithEmail } from '@/lib/auth/email-auth';
import { signInWithGoogleAuthResult } from '@/lib/auth/google-supabase';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const goToApp = useCallback(() => {
    router.replace('/(tabs)');
  }, []);

  async function onSubmit() {
    if (password !== confirm) {
      Alert.alert('Sign up', 'Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const result = await signUpWithEmail(email, password, {
        username,
        first_name: firstName,
        last_name: lastName,
      });
      if (!result.ok) {
        Alert.alert('Sign up', result.message);
        return;
      }
      if (result.needsEmailConfirmation) {
        Alert.alert(
          'Check your email',
          'We sent you a confirmation link. After you confirm, you can log in.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
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
          Alert.alert('Google sign-in', linked.message);
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
      <View style={styles.header}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Email and password, or Google.</Text>
      </View>

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

      <View style={styles.footer}>
        <Text style={styles.footerPrompt}>Already have an account?</Text>
        <Link href="/login" asChild>
          <Pressable accessibilityRole="link">
            <Text style={styles.link}>Log in</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: authSpacing.xs,
    marginBottom: authSpacing.sm,
  },
  title: {
    ...authTypography.title,
    color: authColors.text,
  },
  subtitle: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: authSpacing.xs,
    marginTop: authSpacing.md,
  },
  footerPrompt: {
    ...authTypography.body,
    color: authColors.textMuted,
  },
  link: {
    ...authTypography.link,
    color: authColors.text,
    textDecorationLine: 'underline',
  },
});
