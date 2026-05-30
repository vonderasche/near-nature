import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  OWN_PROFILE_CACHE_KEY_PREFIX,
  OWN_PROFILE_CACHE_VERSION,
} from '@/constants/profile-cache';
import {
  clearAllUserProfileCaches,
  deleteUserProfileCache,
  loadUserProfileCacheJson,
  saveUserProfileCacheJson,
} from '@/lib/db/userCacheRepository';
import { isSqliteUserCacheAvailable } from '@/lib/db/sqliteCacheSupport';
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

async function loadFromAsyncStorage(userId: string): Promise<CachedOwnProfile | null> {
  const raw = await AsyncStorage.getItem(cacheKey(userId));
  const cached = parseCachedOwnProfile(raw);
  if (!cached || cached.user.id !== userId) return null;
  if (cached.stats && cached.stats.id !== userId) return null;
  return cached;
}

export async function loadCachedOwnProfile(userId: string): Promise<CachedOwnProfile | null> {
  if (isSqliteUserCacheAvailable()) {
    const raw = await loadUserProfileCacheJson(userId);
    const cached = parseCachedOwnProfile(raw);
    if (cached && cached.user.id === userId) {
      if (cached.stats && cached.stats.id !== userId) return null;
      return cached;
    }
  }

  const fromAsync = await loadFromAsyncStorage(userId);
  if (fromAsync && isSqliteUserCacheAvailable()) {
    await saveUserProfileCacheJson(
      userId,
      JSON.stringify(fromAsync),
      fromAsync.cachedAt,
      OWN_PROFILE_CACHE_VERSION,
    );
    await AsyncStorage.removeItem(cacheKey(userId)).catch(() => {});
  }
  return fromAsync;
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
  const json = JSON.stringify(entry);

  if (isSqliteUserCacheAvailable()) {
    await saveUserProfileCacheJson(userId, json, entry.cachedAt, OWN_PROFILE_CACHE_VERSION);
    await AsyncStorage.removeItem(cacheKey(userId)).catch(() => {});
    return;
  }

  await AsyncStorage.setItem(cacheKey(userId), json);
}

export async function clearCachedOwnProfile(userId: string): Promise<void> {
  await Promise.all([
    deleteUserProfileCache(userId),
    AsyncStorage.removeItem(cacheKey(userId)),
  ]);
}

/** Clears all cached own-profile entries (e.g. on sign-out). */
export async function clearAllCachedOwnProfiles(): Promise<void> {
  await Promise.all([
    clearAllUserProfileCaches(),
    AsyncStorage.getAllKeys().then((keys) => {
      const ours = keys.filter((k) => k.startsWith(OWN_PROFILE_CACHE_KEY_PREFIX));
      return ours.length > 0 ? AsyncStorage.multiRemove(ours) : undefined;
    }),
  ]);
}
