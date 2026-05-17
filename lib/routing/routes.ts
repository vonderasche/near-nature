/**
 * Expo Router href / pathname strings. Keep aligned with files under `app/(auth)/`, `app/(tabs)/`, etc.
 */
export const routes = {
  tabs: '/(tabs)',
  /** Own profile tab (see `app/(tabs)/profile.tsx`). */
  profileTab: '/(tabs)/profile',
  login: '/login',
  signup: '/signup',
  /** Session exists but `public.users` has no row — sign out or fix DB (e.g. backfill). */
  needsProfile: '/(auth)/needs-profile',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  cameraTab: '/(tabs)/camera',
  explorerBoardTab: '/(tabs)/explorer-board',
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];

/** Another member’s public profile (`app/user/[userId].tsx`). */
export function routePublicUserProfile(userId: string) {
  return { pathname: '/user/[userId]' as const, params: { userId } };
}
