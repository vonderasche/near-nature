import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  GALLERY_LIST_CACHE_KEY_PREFIX,
  GALLERY_LIST_CACHE_VERSION,
} from '@/constants/gallery-cache';
import {
  OWN_PROFILE_CACHE_KEY_PREFIX,
  OWN_PROFILE_CACHE_VERSION,
} from '@/constants/profile-cache';
import {
  SCORING_SNAPSHOT_CACHE_KEY_PREFIX,
  SCORING_SNAPSHOT_CACHE_VERSION,
} from '@/constants/scoring-cache';
import {
  SIGNED_URL_CACHE_KEY_PREFIX,
  SIGNED_URL_PERSISTED_VERSION,
} from '@/constants/signed-url-cache';
import { getAppMeta, setAppMeta } from '@/lib/db/appMeta';
import { getLocalDatabase, isLocalDatabaseSupported } from '@/lib/db/database';
import {
  saveGalleryListCacheJson,
  saveScoringSnapshotCacheJson,
  saveSignedUrlToCache,
  saveUserProfileCacheJson,
} from '@/lib/db/userCacheRepository';

export const LEGACY_ASYNC_CACHE_MIGRATED_META_KEY = 'legacy_async_cache_migrated_v1';

/**
 * One-time import of device caches from AsyncStorage into SQLite after upgrading.
 * Web and tests skip this (no SQLite).
 */
export async function migrateLegacyAsyncStorageCacheIfNeeded(): Promise<void> {
  if (!isLocalDatabaseSupported() || !getLocalDatabase()) return;

  const done = await getAppMeta(LEGACY_ASYNC_CACHE_MIGRATED_META_KEY);
  if (done === '1') return;

  const keys = await AsyncStorage.getAllKeys();
  const keysToRemove: string[] = [];

  for (const key of keys) {
    if (key.startsWith(OWN_PROFILE_CACHE_KEY_PREFIX)) {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { user?: { id?: string }; cachedAt?: number; v?: number };
          const userId = parsed.user?.id;
          if (userId && parsed.v === OWN_PROFILE_CACHE_VERSION) {
            await saveUserProfileCacheJson(
              userId,
              raw,
              parsed.cachedAt ?? Date.now(),
              OWN_PROFILE_CACHE_VERSION,
            );
            keysToRemove.push(key);
          }
        } catch {
          // skip invalid entry
        }
      }
      continue;
    }

    if (key.startsWith(GALLERY_LIST_CACHE_KEY_PREFIX)) {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as {
            userId?: string;
            publicOnly?: boolean;
            cachedAt?: number;
            v?: number;
          };
          if (
            parsed.userId &&
            typeof parsed.publicOnly === 'boolean' &&
            parsed.v === GALLERY_LIST_CACHE_VERSION
          ) {
            await saveGalleryListCacheJson(
              parsed.userId,
              parsed.publicOnly,
              raw,
              parsed.cachedAt ?? Date.now(),
              GALLERY_LIST_CACHE_VERSION,
            );
            keysToRemove.push(key);
          }
        } catch {
          // skip
        }
      }
      continue;
    }

    if (key.startsWith(SCORING_SNAPSHOT_CACHE_KEY_PREFIX)) {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { cachedAt?: number; v?: number };
          const userId = key.slice(SCORING_SNAPSHOT_CACHE_KEY_PREFIX.length);
          if (userId && parsed.v === SCORING_SNAPSHOT_CACHE_VERSION) {
            await saveScoringSnapshotCacheJson(
              userId,
              raw,
              parsed.cachedAt ?? Date.now(),
              SCORING_SNAPSHOT_CACHE_VERSION,
            );
            keysToRemove.push(key);
          }
        } catch {
          // skip
        }
      }
      continue;
    }

    if (key.startsWith(SIGNED_URL_CACHE_KEY_PREFIX)) {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as {
            signedUrl?: string;
            expiresAtMs?: number;
            v?: number;
          };
          const objectPath = key.slice(SIGNED_URL_CACHE_KEY_PREFIX.length);
          if (
            objectPath &&
            parsed.v === SIGNED_URL_PERSISTED_VERSION &&
            typeof parsed.signedUrl === 'string' &&
            typeof parsed.expiresAtMs === 'number'
          ) {
            await saveSignedUrlToCache(
              objectPath,
              parsed.signedUrl,
              parsed.expiresAtMs,
              SIGNED_URL_PERSISTED_VERSION,
            );
            keysToRemove.push(key);
          }
        } catch {
          // skip
        }
      }
    }
  }

  if (keysToRemove.length > 0) {
    await AsyncStorage.multiRemove(keysToRemove);
  }

  await setAppMeta(LEGACY_ASYNC_CACHE_MIGRATED_META_KEY, '1');
}
