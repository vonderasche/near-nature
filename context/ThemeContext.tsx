import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';

import {
  defaultThemeName,
  themes,
  type AppTheme,
  type ThemeName,
} from '@/constants/themes';

type ThemeContextValue = {
  theme: AppTheme;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

type Props = {
  children: ReactNode;
  initialThemeName?: ThemeName;
};

export function AppThemeProvider({ children, initialThemeName = defaultThemeName }: Props) {
  const [themeName, setThemeNameState] = useState<ThemeName>(initialThemeName);

  const setThemeName = useCallback((name: ThemeName) => {
    setThemeNameState(name);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: themes[themeName],
      themeName,
      setThemeName,
    }),
    [themeName, setThemeName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
