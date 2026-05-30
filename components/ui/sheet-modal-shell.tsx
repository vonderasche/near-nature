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

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

export const SHEET_MODAL_MAX_WIDTH = 440;

/**
 * Shared layout + chrome for centered “sheet” modals (dim backdrop, bordered card).
 * Use {@link SheetModalShell} for structure; extend with local `StyleSheet` for feature UI.
 */
export const sheetModalShellStyles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: authSpacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: authColors.overlayScrim,
  },
  sheet: {
    maxWidth: SHEET_MODAL_MAX_WIDTH,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: authColors.background,
    borderWidth: 1,
    borderColor: authColors.border,
    padding: authSpacing.md,
    gap: authSpacing.md,
    elevation: 8,
    shadowColor: authColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1,
  },
  sheetTitle: {
    ...authTypography.title,
    fontSize: 22,
    color: authColors.text,
  },
  sheetMessage: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: authSpacing.sm,
  },
  actionHalf: {
    flex: 1,
  },
  keyboardRoot: {
    flex: 1,
  },
});

export type SheetModalShellProps = {
  visible: boolean;
  /** Android hardware back / iOS swipe dismiss. */
  onRequestClose: () => void;
  /** Backdrop tap; defaults to `onRequestClose`. */
  onBackdropPress?: () => void;
  backdropDisabled?: boolean;
  backdropAccessibilityLabel?: string;
  /** Merged after base `sheet` styles (e.g. `{ maxHeight }` for tall content). */
  sheetStyle?: StyleProp<ViewStyle>;
  /** Wrap the outer frame in `KeyboardAvoidingView` (forms with `TextInput`). */
  keyboardAvoiding?: boolean;
  children: ReactNode;
};

/**
 * `Modal` + dimmed backdrop + centered sheet. Children render inside the sheet container.
 */
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
  if (!visible) {
    return null;
  }

  const dismissBackdrop = onBackdropPress ?? onRequestClose;

  const frame = (
    <View style={sheetModalShellStyles.root} pointerEvents="box-none">
      <Pressable
        style={sheetModalShellStyles.backdrop}
        onPress={dismissBackdrop}
        accessibilityLabel={backdropAccessibilityLabel}
        disabled={backdropDisabled}
      />
      <View style={[sheetModalShellStyles.sheet, sheetStyle]} accessibilityViewIsModal>
        {children}
      </View>
    </View>
  );

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onRequestClose}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={sheetModalShellStyles.keyboardRoot}
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
