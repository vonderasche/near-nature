import type { Href } from 'expo-router';

import { routes } from '@/lib/routing/routes';

export type PostAuthRouteInput = {
  isPasswordRecovery: boolean;
  profileGateResolved: boolean;
  hasProfile: boolean;
};

/** First in-app route after sign-in once the profile gate has resolved. */
export function resolvePostAuthRoute(input: PostAuthRouteInput): Href | null {
  if (!input.profileGateResolved) return null;
  if (input.isPasswordRecovery) return routes.resetPassword as Href;
  if (!input.hasProfile) return routes.needsProfile as Href;
  return routes.tabs as Href;
}
