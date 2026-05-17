import { Text } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ButtonRow, ButtonRowSlot } from '@/components/ui/button-row';
import { SheetModalShell, sheetModalShellStyles } from '@/components/ui/sheet-modal-shell';

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
      <AuthButton title={buttonLabel} fillParent onPress={onDismiss} />
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
      <ButtonRow>
        <ButtonRowSlot>
          <AuthButton
            title={cancelLabel}
            variant="outline"
            fillParent
            onPress={onCancel}
            disabled={confirmLoading}
          />
        </ButtonRowSlot>
        <ButtonRowSlot>
          <AuthButton
            title={confirmLabel}
            variant={confirmDestructive ? 'destructive' : 'primary'}
            fillParent
            onPress={() => void onConfirm()}
            loading={confirmLoading}
            disabled={confirmLoading}
          />
        </ButtonRowSlot>
      </ButtonRow>
    </SheetModalShell>
  );
}
