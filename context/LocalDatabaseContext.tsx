import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { initLocalDatabase } from '@/lib/db/initLocalDatabase';
import { isLocalDatabaseSupported } from '@/lib/db/database';

type LocalDatabaseContextValue = {
  ready: boolean;
  supported: boolean;
  error: string | null;
};

const LocalDatabaseContext = createContext<LocalDatabaseContextValue>({
  ready: false,
  supported: false,
  error: null,
});

export function LocalDatabaseProvider({ children }: { children: ReactNode }) {
  const supported = isLocalDatabaseSupported();
  const [ready, setReady] = useState(!supported);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supported) return;

    let cancelled = false;
    void initLocalDatabase()
      .then(() => {
        if (!cancelled) {
          setReady(true);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setReady(false);
          setError(err instanceof Error ? err.message : 'Local database failed to initialize.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [supported]);

  const value = useMemo(
    () => ({ ready, supported, error }),
    [ready, supported, error],
  );

  return (
    <LocalDatabaseContext.Provider value={value}>{children}</LocalDatabaseContext.Provider>
  );
}

export function useLocalDatabaseReady(): LocalDatabaseContextValue {
  return useContext(LocalDatabaseContext);
}
