import type { AuthSessionResult } from 'expo-auth-session';
import { Link, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthDivider } from '@/components/auth/auth-divider';
import { AuthField } from '@/components/auth/auth-field';
import { AuthScreen } from '@/components/auth/auth-screen';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { signInWithEmail } from '@/lib/auth/email-auth';
import { signInWithGoogleAuthResult } from '@/lib/auth/google-supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const goToApp = useCallback(() => {
    router.replace('/(tabs)');
  }, []);

  async function onSubmit() {
    setBusy(true);
    try {
      const result = await signInWithEmail(email, password);
      if (!result.ok) {
        Alert.alert('Sign in', result.message);
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
        <Text style={styles.title}>Log in</Text>
        <Text style={styles.subtitle}>Use your email or Google.</Text>
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
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        autoComplete="password"
        textContentType="password"
      />

      <AuthButton title="Sign in" onPress={onSubmit} loading={busy} disabled={busy} />

      <Link href="/forgot-password" asChild>
        <Pressable accessibilityRole="link" style={styles.forgotWrap}>
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </Pressable>
      </Link>

      <AuthDivider />

      <GoogleSignInButton onSuccess={onGoogleSuccess} />

      <View style={styles.footer}>
        <Text style={styles.footerPrompt}>No account?</Text>
        <Link href="/signup" asChild>
          <Pressable accessibilityRole="link">
            <Text style={styles.link}>Create one</Text>
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
  forgotWrap: {
    alignSelf: 'flex-start',
    marginTop: authSpacing.sm,
  },
  forgotLink: {
    ...authTypography.link,
    color: authColors.textMuted,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
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
