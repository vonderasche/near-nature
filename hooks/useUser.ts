import { useCallback, useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useCacheFirstFetch } from '@/hooks/useCacheFirstFetch';
import {
  clearCachedOwnProfile,
  loadCachedOwnProfile,
  saveCachedOwnProfile,
} from '@/lib/profile/ownProfileCache';
import { warmSavedSpeciesSession } from '@/lib/identification/savedSpeciesSessionCache';
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

type ProfileBundle = {
  user: User | null;
  stats: PublicUserProfile | null;
};

type UseUserReturn = {
  user: User | null;
  stats: PublicUserProfile | null;
  loading: boolean;
  refreshing: boolean;
  deleting: boolean;
  error: string | null;
  update: (payload: UpdateUserPayload) => Promise<UpdateUserResult>;
  remove: () => Promise<RemoveUserResult>;
  refresh: () => Promise<void>;
};

async function fetchOwnProfileFromNetwork(userId: string): Promise<ProfileBundle> {
  const [user, stats] = await Promise.all([getUser(userId), getPublicUserProfile(userId)]);
  return { user, stats };
}

export function useUser(): UseUserReturn {
  const { userId } = useAuthContext();
  const [deleting, setDeleting] = useState(false);

  const {
    data,
    setData,
    loading,
    refreshing,
    error,
    setError,
    refetch,
  } = useCacheFirstFetch<ProfileBundle>({
    enabled: Boolean(userId),
    loadCache: async () => {
      if (!userId) return null;
      const cached = await loadCachedOwnProfile(userId);
      if (!cached) return null;
      return {
        value: { user: cached.user, stats: cached.stats },
        cachedAt: cached.cachedAt,
      };
    },
    fetchFresh: () => fetchOwnProfileFromNetwork(userId!),
    saveCache: (bundle) => {
      if (!bundle.user || !userId) return Promise.resolve();
      return saveCachedOwnProfile(userId, { user: bundle.user, stats: bundle.stats });
    },
    onFresh: async (bundle) => {
      if (bundle.user && userId) {
        await warmSavedSpeciesSession(userId);
        setError(null);
        return;
      }
      if (!bundle.user) {
        setError(
          'No profile row found. Try signing out and back in, or check your database trigger.',
        );
      }
    },
    mapError: (e) => userFacingFromUnknown(e, 'Failed to fetch user').message,
  });

  const user = data?.user ?? null;
  const stats = data?.stats ?? null;

  const update = useCallback(
    async (payload: UpdateUserPayload): Promise<UpdateUserResult> => {
      if (!user) {
        return userFacingErr('Not signed in.');
      }
      setError(null);
      try {
        const updated = await updateUser(user.id, payload);
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
        const bundle = { user: updated, stats: nextStats };
        setData(bundle);
        await saveCachedOwnProfile(updated.id, bundle);
        return userFacingOk();
      } catch (err: unknown) {
        const failure = userFacingFromUnknown(err, 'Failed to update user');
        setError(failure.message);
        return failure;
      }
    },
    [setData, setError, stats, user],
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
      setData(null);
      await signOutLocalOnly();
      return userFacingOk();
    } catch (err: unknown) {
      const failure = userFacingFromUnknown(err, 'Failed to delete user');
      setError(failure.message);
      return failure;
    } finally {
      setDeleting(false);
    }
  }, [setData, setError, user]);

  const refresh = useCallback(async () => {
    await refetch({ force: true });
  }, [refetch]);

  return { user, stats, loading, refreshing, deleting, error, update, remove, refresh };
}
