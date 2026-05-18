import { describe, expect, it } from 'vitest';

import type { CachedOwnProfile } from '@/lib/profile/ownProfileCache';
import { OWN_PROFILE_CACHE_VERSION } from '@/constants/profile-cache';

describe('ownProfileCache payload', () => {
  it('accepts v1 shape', () => {
    const entry: CachedOwnProfile = {
      v: OWN_PROFILE_CACHE_VERSION,
      cachedAt: Date.now(),
      user: {
        id: 'u1',
        email: 'a@b.c',
        username: 'naturalist',
        first_name: 'A',
        last_name: 'B',
        motto: null,
        avatar_url: null,
        state: 'FL',
        created_at: '',
        updated_at: '',
      },
      stats: {
        id: 'u1',
        username: 'naturalist',
        motto: null,
        state: 'FL',
        avatar_url: null,
        currentStreak: 1,
        longestStreak: 2,
        publicPoints: 10,
        publicSpeciesCount: 3,
        ownerPoints: 12,
        ownerSpeciesCount: 4,
      },
    };
    expect(entry.v).toBe(1);
    expect(JSON.parse(JSON.stringify(entry)).user.id).toBe('u1');
  });
});
