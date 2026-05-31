/**
 * Resolves themed colors. Light and dark palettes are identical in this app.
 */

import { Colors } from '@/constants/auth-theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const colorFromProps = props.light ?? props.dark;

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors.light[colorName];
}
