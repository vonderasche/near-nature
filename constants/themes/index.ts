import { buildTheme } from './shared';
import { darkThemePreset } from './dark';
import { forestLightThemePreset } from './forestLight';
import { lightThemePreset } from './light';
import { neutralGrayThemePreset } from './neutralGray';

export type {
  AppTheme,
  AppThemeColors,
  AppThemeMap,
  AppThemeRadii,
  AppThemeSpacing,
  AppThemeTypography,
  ThemePreset,
} from './types';

/**
 * Registered appearance presets.
 *
 * To add a theme: create `constants/themes/<name>.ts` exporting a `ThemePreset`,
 * import it here, and add one entry to `themeRegistry`.
 *
 * To remove a theme: delete its file and remove its registry entry (also update
 * `THEME_LABELS` / `SELECTABLE_THEME_NAMES` in `constants/theme-preferences.ts`).
 */
export const themeRegistry = {
  dark: buildTheme(darkThemePreset),
  light: buildTheme(lightThemePreset),
  neutralGray: buildTheme(neutralGrayThemePreset),
  forestLight: buildTheme(forestLightThemePreset),
} as const;

export type ThemeName = keyof typeof themeRegistry;

export const themes: Record<ThemeName, (typeof themeRegistry)[ThemeName]> = themeRegistry;

export const themeNames = Object.keys(themeRegistry) as ThemeName[];

export const defaultThemeName: ThemeName = 'dark';
