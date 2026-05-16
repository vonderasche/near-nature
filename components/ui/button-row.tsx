import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { sheetModalShellStyles } from '@/components/ui/sheet-modal-shell';

type ButtonRowProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Horizontal row of equal-width button slots (Cancel / Save, etc.). */
export function ButtonRow({ children, style }: ButtonRowProps) {
  return <View style={[sheetModalShellStyles.actionRow, style]}>{children}</View>;
}

type ButtonRowSlotProps = {
  children: ReactNode;
};

export function ButtonRowSlot({ children }: ButtonRowSlotProps) {
  return <View style={sheetModalShellStyles.actionHalf}>{children}</View>;
}
