import { useLocalSearchParams } from 'expo-router';

import { normalizePhotoUri, paramToString } from '@/lib/routing/searchParams';

export const DEFAULT_USER_STATE = process.env.EXPO_PUBLIC_USER_STATE ?? 'FL';

export function useIdentificationRouteParams(): {
  photoUri: string | undefined;
  userState: string;
} {
  const { uri, userState: userStateParam } = useLocalSearchParams<{
    uri?: string | string[];
    userState?: string | string[];
  }>();
  const photoUri = normalizePhotoUri(paramToString(uri));
  const userState = paramToString(userStateParam) ?? DEFAULT_USER_STATE;
  return { photoUri, userState };
}
