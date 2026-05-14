/**
 * App-wide design tokens. Dark surface: black background, light text, subtle borders.
 * Screens and auth components read from here so the palette can be swapped in one place.
 */
export const authColors = {
  background: '#000000',
  text: '#ffffff',
  textMuted: '#a8a8a8',
  border: '#3d3d3d',
  fieldBackground: '#1a1a1a',
  primaryFill: '#ffffff',
  primaryOnFill: '#000000',
  danger: '#ff453a',
} as const;

export const authSpacing = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const authRadii = {
  field: 4,
  button: 4,
} as const;

export const authTypography = {
  title: { fontSize: 28, fontWeight: '700' as const },
  subtitle: { fontSize: 14, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  link: { fontSize: 15, fontWeight: '500' as const },
} as const;
