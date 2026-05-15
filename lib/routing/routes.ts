/**
 * Expo Router href / pathname strings. Keep aligned with files under `app/(auth)/`, `app/(tabs)/`, etc.
 */
export const routes = {
  tabs: '/(tabs)',
  /** Own profile tab (see `app/(tabs)/profile.tsx`). */
  profileTab: '/(tabs)/profile',
  modal: '/modal',
  login: '/login',
  signup: '/signup',
  /** Session exists but `public.users` has no row — sign out or fix DB (e.g. backfill). */
  needsProfile: '/(auth)/needs-profile',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  camera: '/camera',
  /** Hidden tab (see `app/(tabs)/_layout.tsx` `href: null`) */
  cameraPreview: '/(tabs)/camera-preview',
  identificationResults: '/(tabs)/identification-results',
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];

export function cameraPreviewWithPhoto(uri: string) {
  return { pathname: routes.cameraPreview, params: { uri } } as const;
}

export function identificationResultsWithPhoto(uri: string) {
  return { pathname: routes.identificationResults, params: { uri } } as const;
}

/** Another member’s public profile (`app/user/[userId].tsx`). */
export function routePublicUserProfile(userId: string) {
  return { pathname: '/user/[userId]' as const, params: { userId } };
}
