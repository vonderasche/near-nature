import { defaultThemeName, type ThemeName } from '@/constants/themes';

export const THEME_STORAGE_KEY = 'near_nature:theme';

const THEME_NAMES: ThemeName[] = ['dark', 'light', 'neutralGray'];

export function parseThemeName(raw: string | null): ThemeName {
  if (raw && (THEME_NAMES as readonly string[]).includes(raw)) {
    return raw as ThemeName;
  }
  return defaultThemeName;
}

export const THEME_LABELS: Record<ThemeName, string> = {
  dark: 'Dark',
  light: 'Light',
  neutralGray: 'Neutral gray',
};

/** Themes shown in the appearance picker (neutralGray kept for legacy persisted prefs). */
export const SELECTABLE_THEME_NAMES: ThemeName[] = ['dark', 'light'];
