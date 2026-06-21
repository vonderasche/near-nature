import type { ReactNode } from 'react';
import { Text as RNText, StyleSheet, type StyleProp, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

type TextVariant = 'body' | 'subtitle' | 'caption' | 'label';
type TextColor = 'primary' | 'secondary' | 'accent';

type TextProps = {
  children: ReactNode;
  variant?: TextVariant;
  color?: TextColor;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

export function Text({
  children,
  variant = 'body',
  color = 'primary',
  style,
  numberOfLines,
}: TextProps) {
  const { theme } = useTheme();

  const colorValue =
    color === 'secondary'
      ? theme.colors.textSecondary
      : color === 'accent'
        ? theme.colors.accent
        : theme.colors.textPrimary;

  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[theme.typography[variant], { color: colorValue }, style]}>
      {children}
    </RNText>
  );
}

/** Muted supporting copy for empty states and hints. */
export const mutedTextStyle = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
});
