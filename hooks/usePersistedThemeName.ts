import { usePersistedPreference } from '@/hooks/usePersistedPreference';
import { parseThemeName, THEME_STORAGE_KEY } from '@/constants/theme-preferences';
import { defaultThemeName, type ThemeName } from '@/constants/themes';

export function usePersistedThemeName() {
  return usePersistedPreference<ThemeName>(
    THEME_STORAGE_KEY,
    parseThemeName,
    defaultThemeName,
  );
}
