/**
 * Expo Router href / pathname strings. Keep aligned with files under `app/(auth)/`, `app/(tabs)/`, etc.
 */
export const routes = {
  tabs: '/(tabs)',
  /** Own profile tab (see `app/(tabs)/profile/`). */
  profileTab: '/(tabs)/profile',
  profileSettings: '/(tabs)/profile/settings',
  profileEditMotto: '/(tabs)/profile/edit-motto',
  profileEditState: '/(tabs)/profile/edit-state',
  profileGalleryFilter: '/(tabs)/profile/gallery-filter',
  login: '/login',
  signup: '/signup',
  /** Session exists but `public.users` has no row — sign out or fix DB (e.g. backfill). */
  needsProfile: '/needs-profile',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  cameraTab: '/(tabs)/camera',
  discoverTab: '/(tabs)/discover',
  discoverSpeciesFilter: '/(tabs)/discover/species-filter',
  explorerBoardTab: '/(tabs)/explorer-board',
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];

/** On-device identification results after capture or gallery pick. */
export function routeCameraIdentification(params: { uri: string; userState?: string }) {
  return {
    pathname: '/(tabs)/camera/identification' as const,
    params,
  };
}

export function routeProfileDetection(params: { detectionId: string }) {
  return {
    pathname: '/(tabs)/profile/detection/[detectionId]' as const,
    params,
  };
}

export function routeCameraDetection(params: { detectionId: string }) {
  return {
    pathname: '/(tabs)/camera/detection/[detectionId]' as const,
    params,
  };
}

/** Another member’s public profile (`app/user/[userId]/index.tsx`). */
export function routePublicUserProfile(userId: string) {
  return { pathname: '/user/[userId]' as const, params: { userId } };
}

export function routePublicUserGalleryFilter(userId: string) {
  return {
    pathname: '/user/[userId]/gallery-filter' as const,
    params: { userId },
  };
}

export function routePublicUserDetection(params: { userId: string; detectionId: string }) {
  return {
    pathname: '/user/[userId]/detection/[detectionId]' as const,
    params,
  };
}

export function routeDiscoverPark(params: { parkId: string; latitude?: string; longitude?: string }) {
  return {
    pathname: '/(tabs)/discover/park/[parkId]' as const,
    params,
  };
}

export function routeDiscoverSpecies(params: { kind: 'plant' | 'animal'; name: string }) {
  return {
    pathname: '/(tabs)/discover/species/[speciesSlug]' as const,
    params: {
      speciesSlug: encodeURIComponent(params.name),
      kind: params.kind,
      name: params.name,
    },
  };
}

export function routeDiscoverSpeciesFilter(params: { kind: 'plant' | 'animal' }) {
  return {
    pathname: '/(tabs)/discover/species-filter' as const,
    params,
  };
}
