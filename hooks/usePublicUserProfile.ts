import { useCallback, useEffect, useState } from 'react';

import { getPublicUserProfile, type PublicUserProfile } from '@/services/userService';

export function usePublicUserProfile(userId: string | undefined): {
  profile: PublicUserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const row = await getPublicUserProfile(userId);
      setProfile(row);
      if (!row) {
        setError('This profile could not be found.');
      }
    } catch (e) {
      setProfile(null);
      setError(e instanceof Error ? e.message : 'Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return { profile, isLoading, error, refetch: fetchProfile };
}
