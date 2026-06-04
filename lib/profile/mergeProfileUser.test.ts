import { describe, expect, it } from 'vitest';

import { mergeProfileUser } from '@/lib/profile/mergeProfileUser';
import type { User } from '@/services/userService';

const base: User = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'nature_fan',
  first_name: 'Ada',
  last_name: 'Lovelace',
  motto: 'Old motto',
  avatar_url: null,
  state: 'CA',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('mergeProfileUser', () => {
  it('keeps required fields when RPC row is partial', () => {
    const merged = mergeProfileUser(base, {
      id: base.id,
      motto: 'New motto',
      updated_at: '2024-06-01T00:00:00Z',
    });

    expect(merged.motto).toBe('New motto');
    expect(merged.email).toBe(base.email);
    expect(merged.username).toBe(base.username);
    expect(merged.first_name).toBe(base.first_name);
  });

  it('clears motto when RPC returns null', () => {
    const merged = mergeProfileUser(base, { id: base.id, motto: null });
    expect(merged.motto).toBeNull();
  });
});
