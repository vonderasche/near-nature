import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

/**
 * Loads a value from AsyncStorage on mount and persists on update.
 */
export function usePersistedPreference<T>(
  storageKey: string,
  parse: (raw: string | null) => T,
  defaultValue: T,
) {
  const [value, setValue] = useState<T>(defaultValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(storageKey).then((raw) => {
      if (!cancelled) {
        setValue(parse(raw));
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [parse, storageKey]);

  const setPersisted = useCallback(
    (next: T) => {
      setValue(next);
      void AsyncStorage.setItem(storageKey, String(next));
    },
    [storageKey],
  );

  return { value, setValue: setPersisted, ready };
}
