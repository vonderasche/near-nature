import { useCallback, useEffect, useRef, useState } from 'react';

export type UseAsyncResourceOptions<T> = {
  /** When false, clears data/error and skips fetch. */
  enabled?: boolean;
  emptyValue: T;
  /** Start in loading state on first fetch (default true). */
  initialLoading?: boolean;
  /** Clear error when query key is empty (default true). */
  clearErrorWhenDisabled?: boolean;
  fetcher: () => Promise<T>;
  onError?: (error: unknown) => string;
};

export function useAsyncResource<T>({
  enabled = true,
  emptyValue,
  initialLoading = true,
  clearErrorWhenDisabled = true,
  fetcher,
  onError,
}: UseAsyncResourceOptions<T>) {
  const [data, setData] = useState<T>(emptyValue);
  const [isLoading, setIsLoading] = useState(initialLoading && enabled);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedOnceRef = useRef(false);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setData(emptyValue);
      if (clearErrorWhenDisabled) setError(null);
      setIsLoading(false);
      return;
    }

    setError(null);
    if (!hasFetchedOnceRef.current) {
      setIsLoading(true);
    }

    try {
      setData(await fetcher());
      hasFetchedOnceRef.current = true;
    } catch (e) {
      setData(emptyValue);
      setError(onError ? onError(e) : e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }, [clearErrorWhenDisabled, emptyValue, enabled, fetcher, onError]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
