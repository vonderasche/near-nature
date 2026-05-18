import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import {
  clearCachedOwnProfile,
  loadCachedOwnProfile,
  saveCachedOwnProfile,
} from '@/lib/profile/ownProfileCache';
import { signOutLocalOnly } from '@/services/authService';
import {
  deleteAccount,
  getPublicUserProfile,
  getUser,
  updateUser,
  type PublicUserProfile,
  type UpdateUserPayload,
  type User,
} from '@/services/userService';
import {
  userFacingErr,
  userFacingFromUnknown,
  userFacingOk,
  type UserFacingResult,
} from '@/types/user-facing-result';

export type RemoveUserResult = UserFacingResult;
export type UpdateUserResult = UserFacingResult;

type UseUserReturn = {
  user: User | null;
  /** Points, streaks, species counts (from `get_public_user_profile`). */
  stats: PublicUserProfile | null;
  loading: boolean;
  /** True while a background refresh is in flight after showing cache. */
  refreshing: boolean;
  deleting: boolean;
  error: string | null;
  update: (payload: UpdateUserPayload) => Promise<UpdateUserResult>;
  remove: () => Promise<RemoveUserResult>;
  /** Re-fetch from Supabase and update device cache. */
  refresh: () => Promise<void>;
};

async function fetchOwnProfileFromNetwork(userId: string): Promise<{
  user: User | null;
  stats: PublicUserProfile | null;
}> {
  const [user, stats] = await Promise.all([getUser(userId), getPublicUserProfile(userId)]);
  return { user, stats };
}

export function useUser(): UseUserReturn {
  const { userId } = useAuthContext();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hadCacheRef = useRef(false);

  const applyCache = useCallback((cached: Awaited<ReturnType<typeof loadCachedOwnProfile>>) => {
    if (!cached) return false;
    setUser(cached.user);
    setStats(cached.stats);
    hadCacheRef.current = true;
    return true;
  }, []);

  const persistCache = useCallback(async (uid: string, profile: User, profileStats: PublicUserProfile | null) => {
    await saveCachedOwnProfile(uid, { user: profile, stats: profileStats });
  }, []);

  const fetchUser = useCallback(
    async (options?: { force?: boolean }) => {
      if (!userId) {
        setUser(null);
        setStats(null);
        setError(null);
        setLoading(false);
        setRefreshing(false);
        hadCacheRef.current = false;
        return;
      }

      const force = options?.force ?? false;
      let showedCache = false;

      if (!force) {
        const cached = await loadCachedOwnProfile(userId);
        showedCache = applyCache(cached);
        if (showedCache) {
          setLoading(false);
          setRefreshing(true);
        } else {
          setLoading(true);
        }
      } else {
        setRefreshing(true);
      }

      setError(null);

      try {
        const { user: profile, stats: profileStats } = await fetchOwnProfileFromNetwork(userId);
        setUser(profile);
        setStats(profileStats);
        if (profile) {
          await persistCache(userId, profile, profileStats);
        }
        if (!profile) {
          setError('No profile row found. Try signing out and back in, or check your database trigger.');
        }
      } catch (err: unknown) {
        if (!showedCache && !hadCacheRef.current) {
          setUser(null);
          setStats(null);
        }
        setError(userFacingFromUnknown(err, 'Failed to fetch user').message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [applyCache, persistCache, userId],
  );

  useEffect(() => {
    hadCacheRef.current = false;
    void fetchUser();
  }, [fetchUser]);

  const update = useCallback(
    async (payload: UpdateUserPayload): Promise<UpdateUserResult> => {
      if (!user) {
        return userFacingErr('Not signed in.');
      }
      setError(null);
      try {
        const updated = await updateUser(user.id, payload);
        setUser(updated);
        const nextStats =
          stats && stats.id === updated.id
            ? {
                ...stats,
                username: updated.username,
                motto: updated.motto,
                state: updated.state?.trim().length === 2 ? updated.state.trim().toUpperCase() : null,
                avatar_url: updated.avatar_url,
              }
            : stats;
        setStats(nextStats);
        await persistCache(updated.id, updated, nextStats);
        return userFacingOk();
      } catch (err: unknown) {
        const failure = userFacingFromUnknown(err, 'Failed to update user');
        setError(failure.message);
        return failure;
      }
    },
    [persistCache, stats, user],
  );

  const remove = useCallback(async (): Promise<RemoveUserResult> => {
    if (!user) {
      return userFacingErr('No profile loaded.');
    }
    const uid = user.id;
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount();
      await clearCachedOwnProfile(uid);
      setUser(null);
      setStats(null);
      await signOutLocalOnly();
      return userFacingOk();
    } catch (err: unknown) {
      const failure = userFacingFromUnknown(err, 'Failed to delete user');
      setError(failure.message);
      return failure;
    } finally {
      setDeleting(false);
    }
  }, [user]);

  const refresh = useCallback(async () => {
    await fetchUser({ force: true });
  }, [fetchUser]);

  return { user, stats, loading, refreshing, deleting, error, update, remove, refresh };
}
