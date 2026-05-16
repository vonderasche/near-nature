import { describe, expect, it } from 'vitest';

import { looksLikeStaleStoredRefresh } from '@/lib/auth/staleRefreshTokenError';

describe('looksLikeStaleStoredRefresh', () => {
  it('detects AuthApi-style messages', () => {
    expect(looksLikeStaleStoredRefresh({ message: 'Invalid Refresh Token: Refresh Token Not Found' })).toBe(true);
    expect(looksLikeStaleStoredRefresh({ message: 'Invalid Refresh Token Already Used' })).toBe(true);
  });

  it('does not flag network-ish errors', () => {
    expect(looksLikeStaleStoredRefresh({ message: 'Failed to fetch' })).toBe(false);
  });
});
