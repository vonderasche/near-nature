import { routes, type AppRoute } from '@/lib/routing/routes';

export type PostAuthRouteInput = {
  isPasswordRecovery: boolean;
  profileGateResolved: boolean;
  hasProfile: boolean;
};

/** First in-app route after sign-in once the profile gate has resolved. */
export function resolvePostAuthRoute(input: PostAuthRouteInput): AppRoute | null {
  if (!input.profileGateResolved) return null;
  if (input.isPasswordRecovery) return routes.resetPassword;
  if (!input.hasProfile) return routes.needsProfile;
  return routes.tabs;
}
