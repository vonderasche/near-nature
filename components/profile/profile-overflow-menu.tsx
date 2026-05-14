import { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useLogout } from '@/hooks/useLogout';

type Props = {
  onDeleteProfile: () => void;
  deleteBusy?: boolean;
};

/**
 * Top-right overflow control: log out and delete profile live in the sheet instead of the scroll body.
 */
export function ProfileOverflowMenu({ onDeleteProfile, deleteBusy }: Props) {
  const insets = useSafeAreaInsets();
  const { logout, busy: logoutBusy } = useLogout();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const onLogoutPress = useCallback(async () => {
    close();
    await logout();
  }, [close, logout]);

  const onDeletePress = useCallback(() => {
    close();
    onDeleteProfile();
  }, [close, onDeleteProfile]);

  const busy = logoutBusy || deleteBusy;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile menu"
        hitSlop={12}
        onPress={() => setOpen(true)}
        style={styles.trigger}>
        <IconSymbol name="line.3.horizontal" size={26} color={authColors.text} />
      </Pressable>

      <Modal animationType="fade" transparent visible={open} onRequestClose={close}>
        <View style={styles.modalRoot} pointerEvents="box-none">
          <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Dismiss menu" />
          <View
            style={[
              styles.sheet,
              {
                top: insets.top + authSpacing.sm,
                right: authSpacing.lg,
              },
            ]}
            accessibilityViewIsModal>
            <Text style={styles.sheetTitle}>Account</Text>
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={onLogoutPress}
              disabled={busy}>
              <Text style={styles.rowLabel}>Log out</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={onDeletePress}
              disabled={busy || deleteBusy}>
              <Text style={[styles.rowLabel, styles.destructive]}>Delete profile…</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={close}>
              <Text style={[styles.rowLabel, styles.cancel]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    padding: authSpacing.xs,
    marginTop: 2,
  },
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    minWidth: 220,
    backgroundColor: authColors.background,
    borderWidth: 1,
    borderColor: authColors.border,
    paddingVertical: authSpacing.xs,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 1,
  },
  sheetTitle: {
    ...authTypography.label,
    color: authColors.textMuted,
    paddingHorizontal: authSpacing.md,
    paddingVertical: authSpacing.sm,
  },
  row: {
    paddingVertical: authSpacing.md,
    paddingHorizontal: authSpacing.md,
  },
  rowPressed: {
    backgroundColor: authColors.fieldBackground,
  },
  rowLabel: {
    ...authTypography.body,
    color: authColors.text,
  },
  destructive: {
    color: authColors.danger,
    fontWeight: '600',
  },
  cancel: {
    color: authColors.textMuted,
  },
});
