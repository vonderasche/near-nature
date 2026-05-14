/**
 * Expo Router href / pathname strings. Keep aligned with files under `app/(auth)/`, `app/(tabs)/`, etc.
 */
export const routes = {
  tabs: '/(tabs)',
  modal: '/modal',
  login: '/login',
  signup: '/signup',
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
