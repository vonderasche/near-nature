import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  defaultThemeName,
  themes,
  type AppTheme,
  type ThemeName,
} from '@/constants/themes';
import { usePersistedThemeName } from '@/hooks/usePersistedThemeName';
import { syncLegacyDesignTokens } from '@/lib/theme/syncLegacyDesignTokens';

type ThemeContextValue = {
  theme: AppTheme;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  ready: boolean;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export function AppThemeProvider({ children }: Props) {
  const {
    value: persistedThemeName,
    setValue: setPersistedThemeName,
    ready,
  } = usePersistedThemeName();
  const [themeName, setThemeNameState] = useState<ThemeName>(defaultThemeName);

  useEffect(() => {
    if (ready) {
      setThemeNameState(persistedThemeName);
    }
  }, [persistedThemeName, ready]);

  useEffect(() => {
    syncLegacyDesignTokens(themes[themeName].colors);
  }, [themeName]);

  const setThemeName = useCallback(
    (name: ThemeName) => {
      setThemeNameState(name);
      setPersistedThemeName(name);
    },
    [setPersistedThemeName],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: themes[themeName],
      themeName,
      setThemeName,
      ready,
    }),
    [ready, setThemeName, themeName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
