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

/** US region map + legend on Profile → Region. */
export type AppThemeMap = {
  /** Fill for states in a region that is not selected. */
  stateFillReady: string;
  /** Fill for states in a region that is not ready yet. */
  stateFillPending: string;
  /** Fill for states in the selected region. */
  stateFillSelected: string;
  /** Default stroke for mapped states. */
  stateStroke: string;
  /** Stroke for states in the selected region. */
  stateStrokeSelected: string;
  /** Fill for states outside regional packs. */
  unmappedFill: string;
  /** Legend row border when selected. */
  legendBorderSelected: string;
  /** Legend row background when selected. */
  legendBackgroundSelected: string;
  /** Legend dot when the region pack is ready. */
  legendSwatchReady: string;
  /** Legend dot when the region pack is not ready. */
  legendSwatchPending: string;
  /** Legend title when the row is selected. */
  legendTitleSelected: string;
  /** “Available” badge text color. */
  legendBadgeReady: string;
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
  map: AppThemeMap;
  spacing: AppThemeSpacing;
  radii: AppThemeRadii;
  typography: AppThemeTypography;
};

export type ThemePreset = {
  colors: AppThemeColors;
  map: AppThemeMap;
};
