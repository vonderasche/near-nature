import { defaultThemeName, themeNames, type ThemeName } from '@/constants/themes';

export const THEME_STORAGE_KEY = 'near_nature:theme';

export function parseThemeName(raw: string | null): ThemeName {
  if (raw && (themeNames as readonly string[]).includes(raw)) {
    return raw as ThemeName;
  }
  return defaultThemeName;
}

export const THEME_LABELS: Record<ThemeName, string> = {
  dark: 'Dark',
  light: 'Light',
  neutralGray: 'Neutral gray',
  forestDark: 'Forest dusk',
  forestLight: 'Forest morning',
};

/** Themes shown in the appearance picker. */
export const SELECTABLE_THEME_NAMES: ThemeName[] = [...themeNames];
