import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

type ScreenCenterProps = {
  children: ReactNode;
  style?: ViewStyle;
  /** Horizontal inset (default matches other full-screen empty states). */
  paddingHorizontal?: number;
};

/**
 * Vertically and horizontally centers content in a flex fill area (empty states, permission prompts).
 */
export function ScreenCenter({
  children,
  style,
  paddingHorizontal,
}: ScreenCenterProps) {
  const { theme } = useTheme();
  const horizontal = paddingHorizontal ?? theme.spacing.lg;

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background, paddingHorizontal: horizontal },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
