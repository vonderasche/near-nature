import { defaultThemeName, themeNames, type ThemeName } from '@/constants/themes';

export const THEME_STORAGE_KEY = 'near_nature:theme';

const REMOVED_THEME_ALIASES: Record<string, ThemeName> = {
  forestDark: 'dark',
  neutralGray: 'dark',
};

export function parseThemeName(raw: string | null): ThemeName {
  if (raw) {
    const migrated = REMOVED_THEME_ALIASES[raw];
    if (migrated) return migrated;
    if ((themeNames as readonly string[]).includes(raw)) {
      return raw as ThemeName;
    }
  }
  return defaultThemeName;
}

export const THEME_LABELS: Record<ThemeName, string> = {
  dark: 'Dark',
  light: 'Light',
  forestLight: 'Light forest',
};
/** Themes shown in the appearance picker. */
export const SELECTABLE_THEME_NAMES: ThemeName[] = [...themeNames];
