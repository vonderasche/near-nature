import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style }: CardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          padding: theme.spacing.lg,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

/** Shared card spacing for stacked lists. */
export const cardListStyle = StyleSheet.create({
  item: {
    marginBottom: 8,
  },
});
