import { devLog } from '@/lib/devLog';
import { warmSavedSpeciesSession } from '@/lib/identification/savedSpeciesSessionCache';
import { loadCachedOwnProfile, saveCachedOwnProfile } from '@/lib/profile/ownProfileCache';
import { getPublicUserProfile, getUser } from '@/services/userService';

/** Prefetch profile + saved-species caches after sign-in so Camera/Profile open fast. */
export async function warmAuthUserCaches(userId: string): Promise<void> {
  void warmSavedSpeciesSession(userId).catch(() => {});

  const cached = await loadCachedOwnProfile(userId);
  if (cached) return;

  try {
    const [user, stats] = await Promise.all([getUser(userId), getPublicUserProfile(userId)]);
    if (user) {
      await saveCachedOwnProfile(userId, { user, stats });
      devLog('[auth] warmed profile cache', { userId });
    }
  } catch {
    // Non-blocking; Profile screen will fetch on open.
  }
}
