import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const maybeSingle = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle })),
      })),
    })),
  },
}));

import { supabase } from '@/lib/supabase';

import { getUser } from './userService';

const minimalUser = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  email: 'a@b.co',
  username: 'u',
  first_name: 'f',
  last_name: 'l',
  motto: null,
  avatar_url: null,
  state: 'AZ',
  created_at: '1',
  updated_at: '1',
};

describe('getUser', () => {
  beforeEach(() => {
    maybeSingle.mockResolvedValue({ data: minimalUser, error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('coalesces concurrent requests for the same user id into one query', async () => {
    const uid = minimalUser.id;
    const [a, b, c] = await Promise.all([getUser(uid), getUser(uid), getUser(uid)]);

    expect(maybeSingle).toHaveBeenCalledTimes(1);
    expect(a).toEqual(minimalUser);
    expect(b).toEqual(minimalUser);
    expect(c).toEqual(minimalUser);
    expect(supabase.from).toHaveBeenCalledWith('users');
  });

  it('runs a new query after the previous in-flight request completes', async () => {
    const uid = minimalUser.id;
    await getUser(uid);
    expect(maybeSingle).toHaveBeenCalledTimes(1);

    await getUser(uid);
    expect(maybeSingle).toHaveBeenCalledTimes(2);
  });
});
