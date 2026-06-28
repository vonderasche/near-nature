import { tint } from '@/constants/design-tokens';

import type { ThemePreset } from './types';

export const lightThemePreset: ThemePreset = {
  colors: {
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
  },
  map: {
    stateFillReady: 'rgba(0,0,0,0.06)',
    stateFillPending: 'rgba(0,0,0,0.03)',
    stateFillSelected: 'rgba(0,0,0,0.12)',
    stateStroke: '#d1d1d6',
    stateStrokeSelected: '#1c1c1e',
    unmappedFill: 'rgba(0,0,0,0.04)',
    legendBorderSelected: '#1c1c1e',
    legendBackgroundSelected: 'rgba(0,0,0,0.04)',
    legendSwatchReady: '#1c1c1e',
    legendSwatchPending: '#8e8e93',
    legendTitleSelected: '#1c1c1e',
    legendBadgeReady: '#636366',
  },
};
