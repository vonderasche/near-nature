import { tint } from '@/constants/design-tokens';

import type { ThemePreset } from './types';

export const neutralGrayThemePreset: ThemePreset = {
  colors: {
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
  },
  map: {
    stateFillReady: 'rgba(255,255,255,0.08)',
    stateFillPending: 'rgba(255,255,255,0.04)',
    stateFillSelected: 'rgba(255,255,255,0.16)',
    stateStroke: '#48484a',
    stateStrokeSelected: '#f2f2f7',
    unmappedFill: 'rgba(255,255,255,0.08)',
    legendBorderSelected: '#f2f2f7',
    legendBackgroundSelected: 'rgba(255,255,255,0.08)',
    legendSwatchReady: '#f2f2f7',
    legendSwatchPending: '#aeaeb2',
    legendTitleSelected: '#f2f2f7',
    legendBadgeReady: '#aeaeb2',
  },
};
