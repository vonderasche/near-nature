import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  OWN_PROFILE_CACHE_KEY_PREFIX,
  OWN_PROFILE_CACHE_VERSION,
} from '@/constants/profile-cache';
import type { PublicUserProfile, User } from '@/services/userService';

export type CachedOwnProfile = {
  v: typeof OWN_PROFILE_CACHE_VERSION;
  user: User;
  stats: PublicUserProfile | null;
  cachedAt: number;
};

function cacheKey(userId: string): string {
  return `${OWN_PROFILE_CACHE_KEY_PREFIX}${userId}`;
}

function isUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') return false;
  const u = value as User;
  return (
    typeof u.id === 'string' &&
    typeof u.email === 'string' &&
    typeof u.username === 'string' &&
    typeof u.first_name === 'string' &&
    typeof u.last_name === 'string'
  );
}

function isPublicUserProfile(value: unknown): value is PublicUserProfile {
  if (!value || typeof value !== 'object') return false;
  const p = value as PublicUserProfile;
  return typeof p.id === 'string' && typeof p.username === 'string';
}

function parseCachedOwnProfile(raw: string | null): CachedOwnProfile | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedOwnProfile;
    if (parsed.v !== OWN_PROFILE_CACHE_VERSION) return null;
    if (!isUser(parsed.user)) return null;
    if (parsed.stats != null && !isPublicUserProfile(parsed.stats)) return null;
    if (typeof parsed.cachedAt !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function loadCachedOwnProfile(userId: string): Promise<CachedOwnProfile | null> {
  const raw = await AsyncStorage.getItem(cacheKey(userId));
  const cached = parseCachedOwnProfile(raw);
  if (!cached || cached.user.id !== userId) return null;
  if (cached.stats && cached.stats.id !== userId) return null;
  return cached;
}

export async function saveCachedOwnProfile(
  userId: string,
  payload: { user: User; stats: PublicUserProfile | null },
): Promise<void> {
  const entry: CachedOwnProfile = {
    v: OWN_PROFILE_CACHE_VERSION,
    user: payload.user,
    stats: payload.stats,
    cachedAt: Date.now(),
  };
  await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(entry));
}

export async function clearCachedOwnProfile(userId: string): Promise<void> {
  await AsyncStorage.removeItem(cacheKey(userId));
}

/** Clears all cached own-profile entries (e.g. on sign-out). */
export async function clearAllCachedOwnProfiles(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const ours = keys.filter((k) => k.startsWith(OWN_PROFILE_CACHE_KEY_PREFIX));
  if (ours.length > 0) {
    await AsyncStorage.multiRemove(ours);
  }
}
