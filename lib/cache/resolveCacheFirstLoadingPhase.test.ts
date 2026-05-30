import { describe, expect, it } from 'vitest';

import { resolveCacheFirstLoadingPhase } from '@/lib/cache/resolveCacheFirstLoadingPhase';

describe('resolveCacheFirstLoadingPhase', () => {
  it('uses cache immediately and refreshes in the background when stale', () => {
    expect(resolveCacheFirstLoadingPhase(false, { id: '1' })).toEqual({
      showedCache: true,
      initialLoading: false,
      backgroundRefreshing: true,
    });
  });

  it('uses cache only when still fresh', () => {
    expect(resolveCacheFirstLoadingPhase(false, { id: '1' }, { cacheIsFresh: true })).toEqual({
      showedCache: true,
      initialLoading: false,
      backgroundRefreshing: false,
    });
  });

  it('shows full loading when there is no cache', () => {
    expect(resolveCacheFirstLoadingPhase(false, null)).toEqual({
      showedCache: false,
      initialLoading: true,
      backgroundRefreshing: false,
    });
  });

  it('forces background refresh without initial loading', () => {
    expect(resolveCacheFirstLoadingPhase(true, { id: '1' })).toEqual({
      showedCache: false,
      initialLoading: false,
      backgroundRefreshing: true,
    });
  });
});
