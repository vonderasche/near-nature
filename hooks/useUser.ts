import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { signOutLocalOnly } from '@/services/authService';
import { deleteAccount, getUser, updateUser, type UpdateUserPayload, type User } from '@/services/userService';
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
  loading: boolean;
  deleting: boolean;
  error: string | null;
  update: (payload: UpdateUserPayload) => Promise<UpdateUserResult>;
  remove: () => Promise<RemoveUserResult>;
  refresh: () => Promise<void>;
};

export function useUser(): UseUserReturn {
  const { userId } = useAuthContext();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) {
      setUser(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const profile = await getUser(userId);
      setUser(profile);
      if (!profile) {
        setError('No profile row found. Try signing out and back in, or check your database trigger.');
      }
    } catch (err: unknown) {
      setUser(null);
      setError(userFacingFromUnknown(err, 'Failed to fetch user').message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Re-fetches automatically whenever userId changes (login/logout)
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const update = useCallback(async (payload: UpdateUserPayload): Promise<UpdateUserResult> => {
    if (!user) {
      return userFacingErr('Not signed in.');
    }
    setError(null);
    try {
      const updated = await updateUser(user.id, payload);
      setUser(updated);
      return userFacingOk();
    } catch (err: unknown) {
      const failure = userFacingFromUnknown(err, 'Failed to update user');
      setError(failure.message);
      return failure;
    }
  }, [user]);

  const remove = useCallback(async (): Promise<RemoveUserResult> => {
    if (!user) {
      return userFacingErr('No profile loaded.');
    }
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount();
      setUser(null);
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

  return { user, loading, deleting, error, update, remove, refresh: fetchUser };
}