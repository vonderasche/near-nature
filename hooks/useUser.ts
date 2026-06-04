import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useCacheFirstFetch } from '@/hooks/useCacheFirstFetch';
import {
  clearCachedOwnProfile,
  loadCachedOwnProfile,
  saveCachedOwnProfile,
} from '@/lib/profile/ownProfileCache';
import { mergeProfileStats, mergeProfileUser } from '@/lib/profile/mergeProfileUser';
import { formatPostgrestError } from '@/lib/supabase/formatPostgrestError';
import { mapSupabaseAuthErrorMessage } from '@/lib/auth/mapSupabaseAuthError';
import { requestExplorerBoardRefresh } from '@/lib/explorerBoard/explorerBoardRefresh';
import { warmSavedSpeciesSession } from '@/lib/identification/savedSpeciesSessionCache';
import { subscribeProfileRefresh } from '@/lib/profile/profileRefresh';
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
  refresh: (options?: { force?: boolean }) => Promise<void>;
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
    applyLocalPatch,
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
        const row = await updateUser(user.id, payload);
        const mergedUser = mergeProfileUser(user, row);
        const bundle = {
          user: mergedUser,
          stats: mergeProfileStats(stats, mergedUser),
        };
        await applyLocalPatch(bundle);
        if ('motto' in payload || 'avatar_url' in payload || 'username' in payload || 'state' in payload) {
          requestExplorerBoardRefresh();
        }
        return userFacingOk();
      } catch (err: unknown) {
        const failure = userFacingErr(
          err instanceof Error
            ? mapSupabaseAuthErrorMessage(err.message)
            : formatPostgrestError(err, 'Failed to update profile'),
          'Failed to update profile',
        );
        setError(failure.message);
        return failure;
      }
    },
    [applyLocalPatch, setError, stats, user],
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

  const refresh = useCallback(async (options?: { force?: boolean }) => {
    await refetch(options);
  }, [refetch]);

  useEffect(() => {
    if (!userId) return;
    return subscribeProfileRefresh(() => {
      void refetch({ force: true });
    });
  }, [refetch, userId]);

  return { user, stats, loading, refreshing, deleting, error, update, remove, refresh };
}
