import { beforeEach, describe, expect, it, vi } from 'vitest';

import { STATUS_CACHE_TTL_MS } from '@/lib/identification/statusCachePolicy';

const mockGetFirstAsync = vi.fn();
const mockRunAsync = vi.fn();

vi.mock('@/lib/db/database', () => ({
  getLocalDatabase: () => ({
    getFirstAsync: mockGetFirstAsync,
    runAsync: mockRunAsync,
  }),
}));

import { loadStatusCache, saveStatusCache } from '@/lib/db/statusCacheRepository';

describe('statusCacheRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRunAsync.mockResolvedValue(undefined);
  });

  it('returns cached native status when fresh', async () => {
    mockGetFirstAsync.mockResolvedValue({
      status: 'native',
      taxon_id: 42,
      establishment_means: 'native',
      not_found: 0,
      cached_at: Date.now(),
    });

    const entry = await loadStatusCache('Danaus plexippus', 'fl');

    expect(entry).toEqual({
      kind: 'found',
      result: {
        status: 'native',
        taxonId: 42,
        establishmentMeans: 'native',
      },
    });
    expect(mockGetFirstAsync).toHaveBeenCalledWith(expect.any(String), ['danaus plexippus', 'FL']);
  });

  it('returns not_found when cached negative lookup is fresh', async () => {
    mockGetFirstAsync.mockResolvedValue({
      status: 'unknown',
      taxon_id: null,
      establishment_means: null,
      not_found: 1,
      cached_at: Date.now(),
    });

    const entry = await loadStatusCache('Unknown species', 'VA');

    expect(entry).toEqual({ kind: 'not_found' });
  });

  it('treats expired rows as cache miss', async () => {
    mockGetFirstAsync.mockResolvedValue({
      status: 'native',
      taxon_id: 42,
      establishment_means: 'native',
      not_found: 0,
      cached_at: Date.now() - STATUS_CACHE_TTL_MS - 1,
    });

    const entry = await loadStatusCache('Danaus plexippus', 'VA');

    expect(entry).toBeNull();
  });

  it('persists successful lookups', async () => {
    await saveStatusCache('Danaus plexippus', 'VA', {
      status: 'native',
      taxonId: 99,
      establishmentMeans: 'native',
    });

    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO status_cache'),
      ['danaus plexippus', 'VA', 'Danaus plexippus', 'native', 99, 'native', expect.any(Number)],
    );
  });

  it('persists not-found lookups', async () => {
    await saveStatusCache('Mystery taxon', 'TX', null);

    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('not_found'),
      ['mystery taxon', 'TX', 'Mystery taxon', 'unknown', expect.any(Number)],
    );
  });
});
