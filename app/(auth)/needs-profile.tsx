import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthScreenHeader } from '@/components/auth/auth-screen-header';
import type { AppTheme } from '@/constants/themes';
import { useAuthContext } from '@/context/AuthContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { clearOrphanAuthSession } from '@/lib/auth/orphanAuthSession';
import { supabase } from '@/lib/supabase';
import { routes } from '@/lib/routing/routes';
import { signOut } from '@/services/authService';
import { ensurePublicUserProfile, resolveUserProfile } from '@/services/userService';

function createNeedsProfileStyles(theme: AppTheme) {
  return StyleSheet.create({
    body: {
      marginBottom: theme.spacing.lg,
    },
    p: {
      color: theme.colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
    },
    mono: {
      fontFamily: 'monospace',
      color: theme.colors.textPrimary,
    },
    warn: {
      marginTop: theme.spacing.md,
      color: '#ffb020',
      fontSize: 14,
      lineHeight: 20,
    },
    logoutWrap: {
      marginTop: theme.spacing.sm,
    },
  });
}

export default function NeedsProfileScreen() {
  const styles = useThemedStyles(createNeedsProfileStyles);
  const { refreshProfile } = useAuthContext();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onTryAgain = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    try {
      await refreshProfile();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) {
        router.replace(routes.login);
        return;
      }
      if (await resolveUserProfile(uid)) {
        router.replace(routes.tabs);
      } else {
        setMessage(
          'Still no profile row. In Supabase → SQL Editor run sql/ensure_public_user_profile.sql, reload the schema cache, then tap Try again. Or run sql/backfill_public_users_from_auth.sql for all auth users.',
        );
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not check profile.');
    } finally {
      setBusy(false);
    }
  }, [refreshProfile]);

  useEffect(() => {
    void (async () => {
      if (await clearOrphanAuthSession()) {
        router.replace(routes.login);
        return;
      }
      try {
        const created = await ensurePublicUserProfile();
        if (created) {
          await refreshProfile();
          router.replace(routes.tabs);
        }
      } catch {
        // User can tap Try again or follow SQL instructions.
      }
    })();
  }, [refreshProfile]);

  const onLogout = useCallback(async () => {
    setBusy(true);
    try {
      await signOut();
      router.replace(routes.login);
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <AuthScreen>
      <AuthScreenHeader
        title="Account setup"
        subtitle="You are signed in, but there is no profile in the database yet."
      />
      <View style={styles.body}>
        <Text style={styles.p}>
          This app needs a row in <Text style={styles.mono}>public.users</Text> for your account. We try to create it
          automatically; if that fails, an admin must run <Text style={styles.mono}>sql/ensure_public_user_profile.sql</Text>{' '}
          in Supabase, then tap Try again.
        </Text>
        {message ? <Text style={styles.warn}>{message}</Text> : null}
      </View>
      <AuthButton title="Try again" onPress={onTryAgain} loading={busy} disabled={busy} />
      <View style={styles.logoutWrap}>
        <AuthButton title="Log out" onPress={onLogout} loading={busy} disabled={busy} variant="outline" />
      </View>
    </AuthScreen>
  );
}
