import type { AppThemeColors } from '@/constants/themes/types';
import { colors, Colors } from '@/constants/design-tokens';

/** Keeps legacy `authColors` reads in sync with the active appearance theme. */
export function syncLegacyDesignTokens(themeColors: AppThemeColors): void {
  Object.assign(colors, {
    background: themeColors.background,
    text: themeColors.textPrimary,
    textMuted: themeColors.textMuted,
    border: themeColors.border,
    fieldBackground: themeColors.fieldBackground,
    primaryFill: themeColors.primaryFill,
    primaryOnFill: themeColors.primaryOnFill,
    danger: themeColors.danger,
    overlayScrim: themeColors.overlayScrim,
    overlayScrimStrong: themeColors.overlayScrimStrong,
    rippleOnDark: themeColors.rippleOnDark,
    cameraControlActive: themeColors.cameraControlActive,
    surfaceRaised: themeColors.surfaceRaised,
    shadow: themeColors.shadow,
    tabIconDefault: themeColors.tabIconDefault,
  });

  for (const scheme of Object.values(Colors)) {
    Object.assign(scheme as Record<string, string>, {
      text: themeColors.textPrimary,
      background: themeColors.background,
      tabIconDefault: themeColors.tabIconDefault,
      tint: themeColors.accent,
      tabIconSelected: themeColors.accent,
    });
  }
}
