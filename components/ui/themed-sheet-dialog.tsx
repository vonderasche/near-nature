import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

const sheetShell = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: authSpacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: authColors.background,
    borderWidth: 1,
    borderColor: authColors.border,
    padding: authSpacing.md,
    gap: authSpacing.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1,
  },
  title: {
    ...authTypography.title,
    fontSize: 22,
    color: authColors.text,
  },
  message: {
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
});

export type ThemedMessageModalProps = {
  visible: boolean;
  title: string;
  message: string;
  buttonLabel?: string;
  onDismiss: () => void;
};

/** Single-action sheet (replaces light native `Alert` for errors / notices). */
export function ThemedMessageModal({
  visible,
  title,
  message,
  buttonLabel = 'OK',
  onDismiss,
}: ThemedMessageModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onDismiss}>
      <View style={sheetShell.root} pointerEvents="box-none">
        <Pressable style={sheetShell.backdrop} onPress={onDismiss} accessibilityLabel="Dismiss" />
        <View style={sheetShell.sheet} accessibilityViewIsModal>
          <Text style={sheetShell.title}>{title}</Text>
          <Text style={sheetShell.message}>{message}</Text>
          <AuthButton title={buttonLabel} onPress={onDismiss} />
        </View>
      </View>
    </Modal>
  );
}

export type ThemedConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  cancelLabel?: string;
  confirmLabel: string;
  /** When true, confirm uses danger styling (default for deletes). */
  confirmDestructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  confirmLoading?: boolean;
};

/** Two-action sheet (replaces light native confirm `Alert`). */
export function ThemedConfirmModal({
  visible,
  title,
  message,
  cancelLabel = 'Cancel',
  confirmLabel,
  confirmDestructive = true,
  onCancel,
  onConfirm,
  confirmLoading = false,
}: ThemedConfirmModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={sheetShell.root} pointerEvents="box-none">
        <Pressable
          style={sheetShell.backdrop}
          onPress={onCancel}
          accessibilityLabel="Dismiss"
          disabled={confirmLoading}
        />
        <View style={sheetShell.sheet} accessibilityViewIsModal>
          <Text style={sheetShell.title}>{title}</Text>
          <Text style={sheetShell.message}>{message}</Text>
          <View style={sheetShell.actionRow}>
            <View style={sheetShell.actionHalf}>
              <AuthButton title={cancelLabel} variant="outline" onPress={onCancel} disabled={confirmLoading} />
            </View>
            <View style={sheetShell.actionHalf}>
              {confirmDestructive ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={confirmLabel}
                  onPress={() => void onConfirm()}
                  disabled={confirmLoading}
                  style={({ pressed }) => [
                    styles.destructiveBtn,
                    (confirmLoading || pressed) && styles.destructiveBtnPressed,
                  ]}>
                  {confirmLoading ? (
                    <ActivityIndicator color={authColors.danger} />
                  ) : (
                    <Text style={styles.destructiveBtnLabel}>{confirmLabel}</Text>
                  )}
                </Pressable>
              ) : (
                <AuthButton
                  title={confirmLabel}
                  onPress={() => void onConfirm()}
                  loading={confirmLoading}
                  disabled={confirmLoading}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  destructiveBtn: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: authColors.danger,
    minHeight: 48,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authColors.background,
  },
  destructiveBtnPressed: {
    opacity: 0.85,
  },
  destructiveBtnLabel: {
    ...authTypography.body,
    fontWeight: '600',
    color: authColors.danger,
  },
});
