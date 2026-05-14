import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { AuthSessionResult } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';

import { AuthButton } from '@/components/auth/auth-button';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import {
  getGoogleClientIdForPlatform,
  isGoogleAuthConfigured,
  readGoogleAuthEnv,
} from '@/lib/auth/google-config';

type GoogleSignInButtonProps = {
  onSuccess?: (result: AuthSessionResult) => void;
};

const CONFIG_HELP_MESSAGE = `Add OAuth client IDs for ${Platform.OS} via EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, or EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID.`;

/**
 * Mounts the Google OAuth hook only when client IDs exist (library requirement).
 * Without IDs, the same control explains how to configure `.env`.
 */
export function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const configured = isGoogleAuthConfigured();

  if (!configured) {
    return <GoogleSignInNotConfigured />;
  }

  return <GoogleSignInConfigured onSuccess={onSuccess} />;
}

function GoogleSignInNotConfigured() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <AuthButton variant="outline" title="Continue with Google" onPress={() => setHelpOpen(true)} />
      <ThemedMessageModal
        visible={helpOpen}
        title="Google sign-in"
        message={CONFIG_HELP_MESSAGE}
        onDismiss={() => setHelpOpen(false)}
      />
    </>
  );
}

function GoogleSignInConfigured({ onSuccess }: GoogleSignInButtonProps) {
  const env = readGoogleAuthEnv();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: env.webClientId,
    iosClientId: env.iosClientId,
    androidClientId: env.androidClientId,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      onSuccess?.(response);
      return;
    }
    if (response.type === 'error') {
      const message =
        response.error && typeof response.error === 'object' && 'message' in response.error
          ? String((response.error as { message?: string }).message)
          : 'Something went wrong.';
      setErrorMessage(message);
    }
  }, [response, onSuccess]);

  const clientId = getGoogleClientIdForPlatform(env);
  const ready = Boolean(request && clientId);

  return (
    <>
      <AuthButton
        variant="outline"
        title="Continue with Google"
        loading={!ready}
        disabled={!ready}
        onPress={() => promptAsync()}
      />
      <ThemedMessageModal
        visible={errorMessage !== null}
        title="Google sign-in"
        message={errorMessage ?? ''}
        onDismiss={() => setErrorMessage(null)}
      />
    </>
  );
}
