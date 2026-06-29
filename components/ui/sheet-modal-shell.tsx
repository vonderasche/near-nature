import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import type { AppTheme } from '@/constants/themes';
import { useThemedStyles } from '@/hooks/useThemedStyles';

export const SHEET_MODAL_MAX_WIDTH = 440;

export function createSheetModalShellStyles(theme: AppTheme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.overlayScrim,
    },
    sheet: {
      maxWidth: SHEET_MODAL_MAX_WIDTH,
      width: '100%',
      alignSelf: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      gap: theme.spacing.md,
      elevation: 8,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      zIndex: 1,
    },
    sheetTitle: {
      ...theme.typography.title,
      fontSize: 22,
      color: theme.colors.textPrimary,
    },
    sheetMessage: {
      ...theme.typography.subtitle,
      color: theme.colors.textMuted,
      lineHeight: 20,
    },
    actionRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    actionHalf: {
      flex: 1,
    },
    keyboardRoot: {
      flex: 1,
    },
  });
}

export function useSheetModalShellStyles() {
  return useThemedStyles(createSheetModalShellStyles);
}

export type SheetModalShellProps = {
  visible: boolean;
  onRequestClose: () => void;
  onBackdropPress?: () => void;
  backdropDisabled?: boolean;
  backdropAccessibilityLabel?: string;
  sheetStyle?: StyleProp<ViewStyle>;
  keyboardAvoiding?: boolean;
  children: ReactNode;
};

export function SheetModalShell({
  visible,
  onRequestClose,
  onBackdropPress,
  backdropDisabled = false,
  backdropAccessibilityLabel = 'Dismiss',
  sheetStyle,
  keyboardAvoiding = false,
  children,
}: SheetModalShellProps) {
  const styles = useSheetModalShellStyles();

  if (!visible) {
    return null;
  }

  const dismissBackdrop = onBackdropPress ?? onRequestClose;

  const frame = (
    <View style={styles.root} pointerEvents="box-none">
      <Pressable
        style={styles.backdrop}
        onPress={dismissBackdrop}
        accessibilityLabel={backdropAccessibilityLabel}
        disabled={backdropDisabled}
      />
      <View style={[styles.sheet, sheetStyle]} accessibilityViewIsModal>
        {children}
      </View>
    </View>
  );

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onRequestClose}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.keyboardRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents="box-none">
          {frame}
        </KeyboardAvoidingView>
      ) : (
        frame
      )}
    </Modal>
  );
}
