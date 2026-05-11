/**
 * Auth-only design tokens. Screens and auth components read from here so the
 * palette and spacing can be swapped without touching layout logic.
 */
export const authColors = {
  background: '#ffffff',
  text: '#000000',
  textMuted: '#404040',
  border: '#000000',
  fieldBackground: '#ffffff',
  primaryFill: '#000000',
  primaryOnFill: '#ffffff',
  danger: '#000000',
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
