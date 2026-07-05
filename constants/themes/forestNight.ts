import type { ThemePreset } from './types';

/**
 * Near Nature — Forest night
 * Dark companion to Forest meadow: deep canopy backgrounds, cream text, moss green accents.
 */
const night = {
  background: '#1B2219',
  surface: '#232B21',
  surfaceRaised: '#2C3629',
  fieldBackground: '#323D30',

  text: '#F3F1E6',
  textPrimary: '#F3F1E6',
  textSecondary: '#B8C9A8',
  textMuted: '#7A8A6A',

  border: '#3F4D38',

  accent: '#6FA25C',
  accentSoft: '#8BC47A',
  primaryFill: '#4A7C3F',
  primaryOnFill: '#FDFAF4',

  danger: '#E05A4E',
  shadow: 'rgba(0, 0, 0, 0.38)',

  overlayScrim: 'rgba(12, 16, 10, 0.55)',
  overlayScrimStrong: 'rgba(12, 16, 10, 0.82)',
  rippleOnDark: 'rgba(253, 250, 244, 0.12)',

  cameraControlActive: '#8BC47A',

  tabIconDefault: '#7A8A6A',
};

export const forestNightThemePreset: ThemePreset = {
  colors: {
    background: night.background,
    surface: night.surface,
    textPrimary: night.textPrimary,
    textSecondary: night.textSecondary,
    accent: night.accent,
    text: night.text,
    textMuted: night.textMuted,
    border: night.border,
    fieldBackground: night.fieldBackground,
    primaryFill: night.primaryFill,
    primaryOnFill: night.primaryOnFill,
    danger: night.danger,
    overlayScrim: night.overlayScrim,
    overlayScrimStrong: night.overlayScrimStrong,
    rippleOnDark: night.rippleOnDark,
    cameraControlActive: night.cameraControlActive,
    surfaceRaised: night.surfaceRaised,
    shadow: night.shadow,
    tabIconDefault: night.tabIconDefault,
  },
  map: {
    stateFillReady: 'rgba(111, 162, 92, 0.14)',
    stateFillPending: 'rgba(243, 241, 230, 0.04)',
    stateFillSelected: 'rgba(111, 162, 92, 0.28)',
    stateStroke: night.border,
    stateStrokeSelected: night.accent,
    unmappedFill: 'rgba(243, 241, 230, 0.06)',
    legendBorderSelected: night.accent,
    legendBackgroundSelected: 'rgba(111, 162, 92, 0.14)',
    legendSwatchReady: night.accent,
    legendSwatchPending: night.textMuted,
    legendTitleSelected: night.accentSoft,
    legendBadgeReady: night.textMuted,
  },
};
