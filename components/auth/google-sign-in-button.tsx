import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { isGoogleAuthConfigured } from '@/lib/auth/google-config';
import type { GoogleSupabaseResult } from '@/lib/auth/google-supabase';

type GoogleSignInButtonProps = {
  /** Called after the native Google flow + Supabase `signInWithIdToken` attempt finishes. */
  onFinished?: (result: GoogleSupabaseResult) => void | Promise<void>;
  disabled?: boolean;
};

function googleConfigHelpMessage(): string {
  return [
    'Native Google Sign-In needs:',
    '',
    '• EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID — Web OAuth client (same as Supabase Dashboard → Authentication → Providers → Google).',
    '• Android: OAuth “Android” client in Google Cloud for package com.vonderasche.near_nature + your signing SHA-1 (run android\\gradlew.bat signingReport, use Variant debug / release SHA-1 for that keystore).',
    '• iOS builds: EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID from an OAuth “iOS” client.',
    '',
    'Rebuild the APK or dev client after changing `.env` — EXPO_PUBLIC_* values are inlined at bundle time.',
  ].join('\n');
}

export function GoogleSignInButton({ onFinished, disabled = false }: GoogleSignInButtonProps) {
  const configured = isGoogleAuthConfigured();

  if (!configured) {
    return <GoogleSignInNotConfigured />;
  }

  return <GoogleSignInReady onFinished={onFinished} disabled={disabled} />;
}

function GoogleSignInNotConfigured() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <AuthButton
        variant="outline"
        title="Continue with Google"
        onPress={() => setHelpOpen(true)}
        disabled={Platform.OS === 'web'}
      />
      <ThemedMessageModal
        visible={helpOpen}
        title="Google sign-in"
        message={googleConfigHelpMessage()}
        onDismiss={() => setHelpOpen(false)}
      />
    </>
  );
}

function GoogleSignInReady({
  onFinished,
  disabled,
}: {
  onFinished?: GoogleSignInButtonProps['onFinished'];
  disabled: boolean;
}) {
  const [busy, setBusy] = useState(false);

  const run = useCallback(async () => {
    setBusy(true);
    try {
      const { signInWithGoogleNative } = await import('@/lib/auth/googleNativeSignIn');
      const result = await signInWithGoogleNative();
      await onFinished?.(result);
    } finally {
      setBusy(false);
    }
  }, [onFinished]);

  const blocked = Platform.OS === 'web';

  return (
    <AuthButton
      variant="outline"
      title="Continue with Google"
      loading={busy}
      disabled={disabled || blocked || busy}
      onPress={() => void run()}
    />
  );
}
