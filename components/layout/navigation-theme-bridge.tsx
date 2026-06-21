import { useMemo, type ReactNode } from 'react';
import { DarkTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { useTheme } from '@/hooks/useTheme';

type Props = {
  children: ReactNode;
};

/** Maps app theme tokens onto React Navigation + status bar styling. */
export function NavigationThemeBridge({ children }: Props) {
  const { theme, themeName } = useTheme();

  const navigationTheme = useMemo(
    () => ({
      ...DarkTheme,
      dark: themeName !== 'light',
      colors: {
        ...DarkTheme.colors,
        primary: theme.colors.accent,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.textPrimary,
        border: theme.colors.border,
        notification: theme.colors.accent,
      },
    }),
    [theme, themeName],
  );

  return (
    <NavigationThemeProvider value={navigationTheme}>
      {children}
      <StatusBar style={themeName === 'light' ? 'dark' : 'light'} />
    </NavigationThemeProvider>
  );
}
