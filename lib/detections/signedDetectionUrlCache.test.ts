import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearSignedDetectionUrlCache,
  resolveSignedDetectionDisplayUrl,
} from '@/lib/detections/signedDetectionUrlCache';

const PATH = 'user-id/photo.jpg';
const FALLBACK = 'https://example.com/stored.jpg';
const EXPIRES_SEC = 3600;

afterEach(() => {
  clearSignedDetectionUrlCache();
  vi.restoreAllMocks();
});

describe('resolveSignedDetectionDisplayUrl', () => {
  it('caches a successful signed URL and avoids a second sign call', async () => {
    const sign = vi.fn(async () => ({
      ok: true as const,
      signedUrl: 'https://signed.example/photo.jpg',
    }));

    const first = await resolveSignedDetectionDisplayUrl(PATH, EXPIRES_SEC, sign, FALLBACK);
    const second = await resolveSignedDetectionDisplayUrl(PATH, EXPIRES_SEC, sign, FALLBACK);

    expect(first).toBe('https://signed.example/photo.jpg');
    expect(second).toBe(first);
    expect(sign).toHaveBeenCalledTimes(1);
  });

  it('dedupes concurrent sign requests for the same path', async () => {
    let resolveSign!: (value: { ok: true; signedUrl: string }) => void;
    const sign = vi.fn(
      () =>
        new Promise<{ ok: true; signedUrl: string }>((resolve) => {
          resolveSign = resolve;
        }),
    );

    const p1 = resolveSignedDetectionDisplayUrl(PATH, EXPIRES_SEC, sign, FALLBACK);
    const p2 = resolveSignedDetectionDisplayUrl(PATH, EXPIRES_SEC, sign, FALLBACK);

    expect(sign).toHaveBeenCalledTimes(1);

    resolveSign({ ok: true, signedUrl: 'https://signed.example/deduped.jpg' });

    await expect(Promise.all([p1, p2])).resolves.toEqual([
      'https://signed.example/deduped.jpg',
      'https://signed.example/deduped.jpg',
    ]);
  });

  it('does not cache failed sign responses', async () => {
    const sign = vi
      .fn()
      .mockResolvedValueOnce({ ok: false as const, message: 'denied' })
      .mockResolvedValueOnce({ ok: true as const, signedUrl: 'https://signed.example/retry.jpg' });

    const first = await resolveSignedDetectionDisplayUrl(PATH, EXPIRES_SEC, sign, FALLBACK);
    const second = await resolveSignedDetectionDisplayUrl(PATH, EXPIRES_SEC, sign, FALLBACK);

    expect(first).toBe(FALLBACK);
    expect(second).toBe('https://signed.example/retry.jpg');
    expect(sign).toHaveBeenCalledTimes(2);
  });

  it('refreshes when the cache entry is near expiry', async () => {
    const sign = vi
      .fn()
      .mockResolvedValueOnce({ ok: true as const, signedUrl: 'https://signed.example/old.jpg' })
      .mockResolvedValueOnce({ ok: true as const, signedUrl: 'https://signed.example/new.jpg' });

    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(EXPIRES_SEC * 1000 - 4 * 60 * 1000);

    await resolveSignedDetectionDisplayUrl(PATH, EXPIRES_SEC, sign, FALLBACK);
    const refreshed = await resolveSignedDetectionDisplayUrl(PATH, EXPIRES_SEC, sign, FALLBACK);

    expect(refreshed).toBe('https://signed.example/new.jpg');
    expect(sign).toHaveBeenCalledTimes(2);
  });
});
