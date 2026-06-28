import { colors as darkLegacyColors, tint } from '@/constants/design-tokens';

import type { ThemePreset } from './types';

export const darkThemePreset: ThemePreset = {
  colors: {
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
  },
  map: {
    stateFillReady: 'rgba(255,255,255,0.06)',
    stateFillPending: 'rgba(255,255,255,0.03)',
    stateFillSelected: 'rgba(255,255,255,0.14)',
    stateStroke: darkLegacyColors.border,
    stateStrokeSelected: darkLegacyColors.text,
    unmappedFill: darkLegacyColors.surfaceRaised,
    legendBorderSelected: darkLegacyColors.text,
    legendBackgroundSelected: 'rgba(255,255,255,0.06)',
    legendSwatchReady: darkLegacyColors.text,
    legendSwatchPending: darkLegacyColors.textMuted,
    legendTitleSelected: darkLegacyColors.text,
    legendBadgeReady: darkLegacyColors.textMuted,
  },
};
