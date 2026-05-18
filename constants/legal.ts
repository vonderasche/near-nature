/** Bump when Terms or Privacy copy changes materially. Stored in auth metadata at sign-up. */
export const LEGAL_TERMS_VERSION = '2026-05-17';

const DEFAULT_TERMS_URL = 'https://nearnature.app/terms';
const DEFAULT_PRIVACY_URL = 'https://nearnature.app/privacy';

export const legalUrls = {
  terms: process.env.EXPO_PUBLIC_TERMS_URL?.trim() || DEFAULT_TERMS_URL,
  privacy: process.env.EXPO_PUBLIC_PRIVACY_URL?.trim() || DEFAULT_PRIVACY_URL,
} as const;
