import { useLocalSearchParams } from 'expo-router';

import { DEFAULT_USER_STATE } from '@/constants/user-defaults';
import { normalizePhotoUri, paramToString } from '@/lib/routing/searchParams';

export { DEFAULT_USER_STATE };

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
