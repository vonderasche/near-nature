import { describe, expect, it, vi } from 'vitest';

import { withTimeout } from '@/lib/async/withTimeout';

describe('withTimeout', () => {
  it('resolves when the promise completes in time', async () => {
    await expect(withTimeout(Promise.resolve(42), 500, 'timed out')).resolves.toBe(42);
  });

  it('rejects when the promise exceeds the limit', async () => {
    vi.useFakeTimers();
    const never = new Promise<number>(() => {});
    const pending = withTimeout(never, 1000, 'Save timed out');
    vi.advanceTimersByTimeAsync(1000);
    await expect(pending).rejects.toThrow('Save timed out');
    vi.useRealTimers();
  });
});
