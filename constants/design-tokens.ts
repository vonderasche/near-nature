/**
 * Near Nature design tokens — single source of truth for color, spacing, radius, and type scales.
 * Prefer `colors`, `spacing`, `radii`, `typography` in new code.
 * `auth*` aliases match historical naming used across screens and components.
 *
 * Buttons: `components/auth/auth-button` + `components/ui/button-stack` / `button-row`.
 */

/** Semantic palette (dark UI: black surfaces, light text, subtle borders). */
export const colors = {
  background: '#000000',
  text: '#ffffff',
  textMuted: '#a8a8a8',
  border: '#3d3d3d',
  fieldBackground: '#1a1a1a',
  primaryFill: '#ffffff',
  primaryOnFill: '#000000',
  danger: '#ff453a',
  /** Semi-transparent scrim (e.g. camera bottom toolbar over the preview). */
  overlayScrim: 'rgba(0,0,0,0.45)',
} as const;

export const spacing = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  field: 4,
  button: 4,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const },
  subtitle: { fontSize: 14, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  link: { fontSize: 15, fontWeight: '500' as const },
} as const;

/** Same object as {@link colors} — legacy export name. */
export const authColors = colors;
/** Same object as {@link spacing}. */
export const authSpacing = spacing;
/** Same object as {@link radii}. */
export const authRadii = radii;
/** Same object as {@link typography}. */
export const authTypography = typography;
