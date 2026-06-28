import type { ThemePreset } from './types';

/**
 * Near Nature — Forest dusk
 * Near-black with amber undertone, moss green accent, warm cream text.
 */
const dark = {
  background: '#1A1208',
  surface: '#231A0D',
  surfaceRaised: '#2E2214',
  fieldBackground: '#3A2B18',

  text: '#E8D5B0',
  textPrimary: '#E8D5B0',
  textSecondary: '#B09070',
  textMuted: '#7A6050',

  border: '#4A3520',

  accent: '#6BAF5A',
  primaryFill: '#C8A878',
  primaryOnFill: '#2C1A0E',

  danger: '#E05040',
  shadow: 'rgba(0, 0, 0, 0.50)',

  overlayScrim: 'rgba(0, 0, 0, 0.55)',
  overlayScrimStrong: 'rgba(0, 0, 0, 0.82)',
  rippleOnDark: 'rgba(232, 213, 176, 0.14)',

  cameraControlActive: '#C8A878',

  tabIconDefault: '#7A6050',
};

export const forestDarkThemePreset: ThemePreset = {
  colors: {
    background: dark.background,
    surface: dark.surface,
    textPrimary: dark.textPrimary,
    textSecondary: dark.textSecondary,
    accent: dark.accent,
    text: dark.text,
    textMuted: dark.textMuted,
    border: dark.border,
    fieldBackground: dark.fieldBackground,
    primaryFill: dark.primaryFill,
    primaryOnFill: dark.primaryOnFill,
    danger: dark.danger,
    overlayScrim: dark.overlayScrim,
    overlayScrimStrong: dark.overlayScrimStrong,
    rippleOnDark: dark.rippleOnDark,
    cameraControlActive: dark.cameraControlActive,
    surfaceRaised: dark.surfaceRaised,
    shadow: dark.shadow,
    tabIconDefault: dark.tabIconDefault,
  },
  map: {
    stateFillReady: 'rgba(107, 175, 90, 0.10)',
    stateFillPending: 'rgba(107, 175, 90, 0.04)',
    stateFillSelected: 'rgba(107, 175, 90, 0.22)',
    stateStroke: dark.border,
    stateStrokeSelected: dark.accent,
    unmappedFill: dark.surfaceRaised,
    legendBorderSelected: dark.accent,
    legendBackgroundSelected: 'rgba(107, 175, 90, 0.12)',
    legendSwatchReady: dark.accent,
    legendSwatchPending: dark.textMuted,
    legendTitleSelected: dark.accent,
    legendBadgeReady: dark.textMuted,
  },
};
