import { radii as legacyRadii } from '@/constants/design-tokens';

import type { AppTheme, AppThemeSpacing, AppThemeTypography, ThemePreset } from './types';

export const themeSpacing: AppThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const themeTypography: AppThemeTypography = {
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 14, fontWeight: '400' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
  label: { fontSize: 13, fontWeight: '600' },
  link: { fontSize: 15, fontWeight: '500' },
};

export function buildTheme(preset: ThemePreset): AppTheme {
  return {
    colors: preset.colors,
    map: preset.map,
    spacing: themeSpacing,
    radii: {
      sm: legacyRadii.field,
      md: 16,
      field: legacyRadii.field,
      button: legacyRadii.button,
    },
    typography: themeTypography,
  };
}
