import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useSheetModalShellStyles } from '@/components/ui/sheet-modal-shell';

type ButtonRowProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Horizontal row of equal-width button slots (Cancel / Save, etc.). */
export function ButtonRow({ children, style }: ButtonRowProps) {
  const sheetStyles = useSheetModalShellStyles();
  return <View style={[sheetStyles.actionRow, style]}>{children}</View>;
}

type ButtonRowSlotProps = {
  children: ReactNode;
};

export function ButtonRowSlot({ children }: ButtonRowSlotProps) {
  const sheetStyles = useSheetModalShellStyles();
  return <View style={sheetStyles.actionHalf}>{children}</View>;
}
