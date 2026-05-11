import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthField } from '@/components/auth/auth-field';
import { AuthScreen } from '@/components/auth/auth-screen';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
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
      <View style={styles.header}>
        <Text style={styles.title}>Forgot password</Text>
        <Text style={styles.subtitle}>We will email you a reset link.</Text>
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

      <AuthButton title="Send reset link" onPress={onSubmit} loading={busy} disabled={busy} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.footer}>
        <Link href="/login" asChild>
          <Pressable accessibilityRole="link">
            <Text style={styles.link}>Back to log in</Text>
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
    marginTop: authSpacing.md,
  },
  link: {
    ...authTypography.link,
    color: authColors.text,
    textDecorationLine: 'underline',
  },
  error: {
    ...authTypography.body,
    color: authColors.text,
    marginTop: authSpacing.sm,
  },
});
