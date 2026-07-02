import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/devLog', () => ({
  devLog: vi.fn(),
}));

vi.mock('@/api/inaturalist', () => ({
  lookupNativeStatus: vi.fn(),
}));

vi.mock('@/lib/db/statusCacheRepository', () => ({
  loadStatusCache: vi.fn(),
  saveStatusCache: vi.fn(),
}));

import { lookupNativeStatus } from '@/api/inaturalist';
import { loadStatusCache, saveStatusCache } from '@/lib/db/statusCacheRepository';
import { lookupCachedNativeStatus } from '@/lib/identification/lookupCachedNativeStatus';

describe('lookupCachedNativeStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadStatusCache).mockResolvedValue(null);
    vi.mocked(saveStatusCache).mockResolvedValue(undefined);
  });

  it('returns cached result without calling iNaturalist', async () => {
    vi.mocked(loadStatusCache).mockResolvedValue({
      kind: 'found',
      result: { status: 'native', taxonId: 7, establishmentMeans: 'native' },
    });

    const result = await lookupCachedNativeStatus('Quercus virginiana', 'FL');

    expect(result).toEqual({ status: 'native', taxonId: 7, establishmentMeans: 'native' });
    expect(lookupNativeStatus).not.toHaveBeenCalled();
    expect(saveStatusCache).not.toHaveBeenCalled();
  });

  it('fetches live and writes cache on miss', async () => {
    vi.mocked(lookupNativeStatus).mockResolvedValue({
      status: 'invasive',
      taxonId: 12,
      establishmentMeans: 'introduced',
    });

    const result = await lookupCachedNativeStatus('Anolis sagrei', 'FL');

    expect(result?.status).toBe('invasive');
    expect(lookupNativeStatus).toHaveBeenCalledWith('Anolis sagrei', 'FL');
    expect(saveStatusCache).toHaveBeenCalledWith('Anolis sagrei', 'FL', result);
  });

  it('caches not-found responses', async () => {
    vi.mocked(lookupNativeStatus).mockResolvedValue(null);

    const result = await lookupCachedNativeStatus('Not a species', 'FL');

    expect(result).toBeNull();
    expect(saveStatusCache).toHaveBeenCalledWith('Not a species', 'FL', null);
  });
});
