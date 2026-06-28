import type { ThemePreset } from './types';

/**
 * Near Nature — Forest morning
 * Warm cream backgrounds, bark browns, forest green accent.
 */
const light = {
  background: '#F5F0E8',
  surface: '#FDFAF4',
  surfaceRaised: '#EDE6D6',
  fieldBackground: '#E8E0CC',

  text: '#2C1A0E',
  textPrimary: '#2C1A0E',
  textSecondary: '#6B4A2A',
  textMuted: '#9C7A5A',

  border: '#C8B89A',

  accent: '#4A7C3F',
  primaryFill: '#3D2B1A',
  primaryOnFill: '#FDFAF4',

  danger: '#C0392B',
  shadow: 'rgba(44, 26, 14, 0.12)',

  overlayScrim: 'rgba(44, 26, 14, 0.40)',
  overlayScrimStrong: 'rgba(44, 26, 14, 0.72)',
  rippleOnDark: 'rgba(253, 250, 244, 0.18)',

  cameraControlActive: '#2C1A0E',

  tabIconDefault: '#9C7A5A',
};

export const forestLightThemePreset: ThemePreset = {
  colors: {
    background: light.background,
    surface: light.surface,
    textPrimary: light.textPrimary,
    textSecondary: light.textSecondary,
    accent: light.accent,
    text: light.text,
    textMuted: light.textMuted,
    border: light.border,
    fieldBackground: light.fieldBackground,
    primaryFill: light.primaryFill,
    primaryOnFill: light.primaryOnFill,
    danger: light.danger,
    overlayScrim: light.overlayScrim,
    overlayScrimStrong: light.overlayScrimStrong,
    rippleOnDark: light.rippleOnDark,
    cameraControlActive: light.cameraControlActive,
    surfaceRaised: light.surfaceRaised,
    shadow: light.shadow,
    tabIconDefault: light.tabIconDefault,
  },
  map: {
    stateFillReady: 'rgba(74, 124, 63, 0.08)',
    stateFillPending: 'rgba(44, 26, 14, 0.04)',
    stateFillSelected: 'rgba(74, 124, 63, 0.18)',
    stateStroke: light.border,
    stateStrokeSelected: light.accent,
    unmappedFill: light.surfaceRaised,
    legendBorderSelected: light.accent,
    legendBackgroundSelected: 'rgba(74, 124, 63, 0.10)',
    legendSwatchReady: light.accent,
    legendSwatchPending: light.textMuted,
    legendTitleSelected: light.accent,
    legendBadgeReady: light.textMuted,
  },
};
