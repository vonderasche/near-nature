import type { ThemePreset } from './types';

/**
 * Near Nature — Forest meadow
 * Greener take on Light forest: sage surfaces, forest green text accents, moss borders.
 */
const meadow = {
  background: '#F3F1E6',
  surface: '#FDFAF4',
  surfaceRaised: '#E7E8D6',
  fieldBackground: '#DFE3C9',

  text: '#2C1A0E',
  textPrimary: '#2C1A0E',
  textSecondary: '#3F5A2E',
  textMuted: '#7A8A5A',

  border: '#B9C29A',

  accent: '#4A7C3F',
  accentSoft: '#6FA25C',
  primaryFill: '#2F3D22',
  primaryOnFill: '#FDFAF4',

  danger: '#C0392B',
  shadow: 'rgba(44, 26, 14, 0.12)',

  overlayScrim: 'rgba(44, 26, 14, 0.40)',
  overlayScrimStrong: 'rgba(44, 26, 14, 0.72)',
  rippleOnDark: 'rgba(253, 250, 244, 0.18)',

  cameraControlActive: '#2C1A0E',

  tabIconDefault: '#7A8A5A',
};

export const forestMeadowThemePreset: ThemePreset = {
  colors: {
    background: meadow.background,
    surface: meadow.surface,
    textPrimary: meadow.textPrimary,
    textSecondary: meadow.textSecondary,
    accent: meadow.accent,
    text: meadow.text,
    textMuted: meadow.textMuted,
    border: meadow.border,
    fieldBackground: meadow.fieldBackground,
    primaryFill: meadow.primaryFill,
    primaryOnFill: meadow.primaryOnFill,
    danger: meadow.danger,
    overlayScrim: meadow.overlayScrim,
    overlayScrimStrong: meadow.overlayScrimStrong,
    rippleOnDark: meadow.rippleOnDark,
    cameraControlActive: meadow.cameraControlActive,
    surfaceRaised: meadow.surfaceRaised,
    shadow: meadow.shadow,
    tabIconDefault: meadow.tabIconDefault,
  },
  map: {
    stateFillReady: 'rgba(74, 124, 63, 0.10)',
    stateFillPending: 'rgba(44, 26, 14, 0.04)',
    stateFillSelected: 'rgba(74, 124, 63, 0.20)',
    stateStroke: meadow.border,
    stateStrokeSelected: meadow.accent,
    unmappedFill: 'rgba(44, 26, 14, 0.10)',
    legendBorderSelected: meadow.accent,
    legendBackgroundSelected: 'rgba(74, 124, 63, 0.10)',
    legendSwatchReady: meadow.accent,
    legendSwatchPending: meadow.textMuted,
    legendTitleSelected: meadow.accent,
    legendBadgeReady: meadow.textMuted,
  },
};
