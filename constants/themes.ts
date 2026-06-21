import {
  colors as darkLegacyColors,
  radii as legacyRadii,
  tint,
} from './design-tokens';

/** Theme color tokens — no hardcoded colors outside theme presets. */
export type AppThemeColors = {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  /** Legacy aliases used across existing screens during migration. */
  text: string;
  textMuted: string;
  border: string;
  fieldBackground: string;
  primaryFill: string;
  primaryOnFill: string;
  danger: string;
  overlayScrim: string;
  overlayScrimStrong: string;
  rippleOnDark: string;
  cameraControlActive: string;
  surfaceRaised: string;
  shadow: string;
  tabIconDefault: string;
};

export type AppThemeSpacing = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
};

export type AppThemeRadii = {
  sm: number;
  md: number;
  field: number;
  button: number;
};

export type AppThemeTypography = {
  title: { fontSize: number; fontWeight: '700' };
  subtitle: { fontSize: number; fontWeight: '400' };
  body: { fontSize: number; fontWeight: '400' };
  caption: { fontSize: number; fontWeight: '400' };
  label: { fontSize: number; fontWeight: '600' };
  link: { fontSize: number; fontWeight: '500' };
};

export type AppTheme = {
  colors: AppThemeColors;
  spacing: AppThemeSpacing;
  radii: AppThemeRadii;
  typography: AppThemeTypography;
};

export type ThemeName = 'dark' | 'light' | 'neutralGray';

const themeSpacing: AppThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

const themeTypography: AppThemeTypography = {
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 14, fontWeight: '400' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
  label: { fontSize: 13, fontWeight: '600' },
  link: { fontSize: 15, fontWeight: '500' },
};

function buildTheme(colors: AppThemeColors): AppTheme {
  return {
    colors,
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

const darkColors: AppThemeColors = {
  background: darkLegacyColors.background,
  surface: darkLegacyColors.background,
  textPrimary: darkLegacyColors.text,
  textSecondary: darkLegacyColors.textMuted,
  accent: tint,
  text: darkLegacyColors.text,
  textMuted: darkLegacyColors.textMuted,
  border: darkLegacyColors.border,
  fieldBackground: darkLegacyColors.fieldBackground,
  primaryFill: darkLegacyColors.primaryFill,
  primaryOnFill: darkLegacyColors.primaryOnFill,
  danger: darkLegacyColors.danger,
  overlayScrim: darkLegacyColors.overlayScrim,
  overlayScrimStrong: darkLegacyColors.overlayScrimStrong,
  rippleOnDark: darkLegacyColors.rippleOnDark,
  cameraControlActive: darkLegacyColors.cameraControlActive,
  surfaceRaised: darkLegacyColors.surfaceRaised,
  shadow: darkLegacyColors.shadow,
  tabIconDefault: darkLegacyColors.tabIconDefault,
};

const lightColors: AppThemeColors = {
  background: '#ffffff',
  surface: '#ffffff',
  textPrimary: '#1c1c1e',
  textSecondary: '#636366',
  accent: tint,
  text: '#1c1c1e',
  textMuted: '#636366',
  border: '#d1d1d6',
  fieldBackground: '#ffffff',
  primaryFill: '#1c1c1e',
  primaryOnFill: '#ffffff',
  danger: '#ff3b30',
  overlayScrim: 'rgba(0,0,0,0.35)',
  overlayScrimStrong: 'rgba(0,0,0,0.5)',
  rippleOnDark: 'rgba(0,0,0,0.12)',
  cameraControlActive: 'rgba(10,126,164,0.35)',
  surfaceRaised: 'rgba(0,0,0,0.04)',
  shadow: '#000000',
  tabIconDefault: '#8e8e93',
};

const neutralGrayColors: AppThemeColors = {
  background: '#2c2c2e',
  surface: '#2c2c2e',
  textPrimary: '#f2f2f7',
  textSecondary: '#aeaeb2',
  accent: tint,
  text: '#f2f2f7',
  textMuted: '#aeaeb2',
  border: '#48484a',
  fieldBackground: '#3a3a3c',
  primaryFill: '#f2f2f7',
  primaryOnFill: '#2c2c2e',
  danger: '#ff453a',
  overlayScrim: 'rgba(0,0,0,0.45)',
  overlayScrimStrong: 'rgba(0,0,0,0.55)',
  rippleOnDark: 'rgba(255,255,255,0.16)',
  cameraControlActive: 'rgba(10,126,164,0.45)',
  surfaceRaised: 'rgba(255,255,255,0.08)',
  shadow: '#000000',
  tabIconDefault: '#8e8e93',
};

/** Named presets — add `nature` here later without touching components. */
export const themes: Record<ThemeName, AppTheme> = {
  dark: buildTheme(darkColors),
  light: buildTheme(lightColors),
  neutralGray: buildTheme(neutralGrayColors),
};

export const defaultThemeName: ThemeName = 'dark';
