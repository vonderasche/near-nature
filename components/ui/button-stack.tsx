import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { authSpacing } from '@/constants/auth-theme';

type ButtonStackProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Vertical stack of full-width buttons (sheet footers, modals). */
export function ButtonStack({ children, style }: ButtonStackProps) {
  return <View style={[styles.stack, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  stack: {
    gap: authSpacing.sm,
    alignSelf: 'stretch',
    width: '100%',
  },
});
