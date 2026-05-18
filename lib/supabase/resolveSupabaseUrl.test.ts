import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-constants', () => ({
  default: { isDevice: false, expoGoConfig: undefined, manifest2: undefined },
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { resolveSupabaseUrl } from '@/lib/supabase/resolveSupabaseUrl';

describe('resolveSupabaseUrl', () => {
  it('leaves cloud URLs unchanged', () => {
    expect(resolveSupabaseUrl('https://abc.supabase.co')).toBe('https://abc.supabase.co');
  });

  it('leaves local URL on iOS simulator', () => {
    expect(resolveSupabaseUrl('http://127.0.0.1:54321')).toBe('http://127.0.0.1:54321');
  });
});
