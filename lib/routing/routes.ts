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
  discoverSpecies: '/discover/species',
  discoverEcosystems: '/discover/ecosystems',
  discoverParks: '/discover/parks',
} as const;

export function routeDiscoverPark(parkId: string) {
  return { pathname: '/discover/park/[parkId]' as const, params: { parkId } };
}

export type AppRoute = (typeof routes)[keyof typeof routes];

/** Another member’s public profile (`app/user/[userId].tsx`). */
export function routePublicUserProfile(userId: string) {
  return { pathname: '/user/[userId]' as const, params: { userId } };
}
