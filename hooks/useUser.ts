import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { signOut } from '@/services/authService';
import { deleteUser, getUser, updateUser, type UpdateUserPayload, type User } from '@/services/userService';

type UseUserReturn = {
  user: User | null;
  loading: boolean;
  error: string | null;
  update: (payload: UpdateUserPayload) => Promise<void>;
  remove: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function useUser(): UseUserReturn {
  const { userId } = useAuthContext();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Re-fetches automatically whenever userId changes (login/logout)
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const update = useCallback(async (payload: UpdateUserPayload) => {
    if (!user) return;
    setError(null);
    try {
      const updated = await updateUser(user.id, payload);
      setUser(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  }, [user]);

  const remove = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      await deleteUser(user.id);
      await signOut();
      setUser(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  }, [user]);

  return { user, loading, error, update, remove, refresh: fetchUser };
}