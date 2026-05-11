import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import type { AuthSessionResult } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';

import { AuthButton } from '@/components/auth/auth-button';
import {
  getGoogleClientIdForPlatform,
  isGoogleAuthConfigured,
  readGoogleAuthEnv,
} from '@/lib/auth/google-config';

type GoogleSignInButtonProps = {
  onSuccess?: (result: AuthSessionResult) => void;
};

/**
 * Mounts the Google OAuth hook only when client IDs exist (library requirement).
 * Without IDs, the same control explains how to configure `.env`.
 */
export function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const configured = isGoogleAuthConfigured();

  if (!configured) {
    return (
      <AuthButton
        variant="outline"
        title="Continue with Google"
        onPress={() =>
          Alert.alert(
            'Google sign-in',
            `Add OAuth client IDs for ${Platform.OS} via EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, or EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID.`
          )
        }
      />
    );
  }

  return <GoogleSignInConfigured onSuccess={onSuccess} />;
}

function GoogleSignInConfigured({ onSuccess }: GoogleSignInButtonProps) {
  const env = readGoogleAuthEnv();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: env.webClientId,
    iosClientId: env.iosClientId,
    androidClientId: env.androidClientId,
  });

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
      Alert.alert('Google sign-in', message);
    }
  }, [response, onSuccess]);

  const clientId = getGoogleClientIdForPlatform(env);
  const ready = Boolean(request && clientId);

  return (
    <AuthButton
      variant="outline"
      title="Continue with Google"
      loading={!ready}
      disabled={!ready}
      onPress={() => promptAsync()}
    />
  );
}
