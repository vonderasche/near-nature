import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { SheetModalShell, sheetModalShellStyles } from '@/components/ui/sheet-modal-shell';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

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
  return (
    <SheetModalShell visible={visible} onRequestClose={onDismiss} onBackdropPress={onDismiss}>
      <Text style={sheetModalShellStyles.sheetTitle}>{title}</Text>
      <Text style={sheetModalShellStyles.sheetMessage}>{message}</Text>
      <AuthButton title={buttonLabel} onPress={onDismiss} />
    </SheetModalShell>
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
  return (
    <SheetModalShell
      visible={visible}
      onRequestClose={onCancel}
      onBackdropPress={onCancel}
      backdropDisabled={confirmLoading}>
      <Text style={sheetModalShellStyles.sheetTitle}>{title}</Text>
      <Text style={sheetModalShellStyles.sheetMessage}>{message}</Text>
      <View style={sheetModalShellStyles.actionRow}>
        <View style={sheetModalShellStyles.actionHalf}>
          <AuthButton title={cancelLabel} variant="outline" onPress={onCancel} disabled={confirmLoading} />
        </View>
        <View style={sheetModalShellStyles.actionHalf}>
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
    </SheetModalShell>
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
