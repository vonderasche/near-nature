import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ReactNode } from 'react';
import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

export type DiscoverAnchorMenuOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

type Props<T extends string> = {
  value: T;
  options: readonly DiscoverAnchorMenuOption<T>[];
  menuTitle: string;
  triggerAccessibilityLabel: string;
  triggerIcon: ReactNode;
  mutedColor: string;
  borderColor: string;
  onChange: (value: T) => void;
};

/**
 * Icon trigger opening a positioned dropdown (sort, category, etc.).
 */
export function DiscoverAnchorMenu<T extends string>({
  value,
  options,
  menuTitle,
  triggerAccessibilityLabel,
  triggerIcon,
  mutedColor,
  borderColor,
  onChange,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const [menuRight, setMenuRight] = useState<number>(authSpacing.lg);
  const triggerRef = useRef<View>(null);

  const close = useCallback(() => setOpen(false), []);

  const openMenu = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const screenW = Dimensions.get('window').width;
      setMenuTop(y + height + 4);
      setMenuRight(Math.max(authSpacing.sm, screenW - x - width));
      setOpen(true);
    });
  }, []);

  const select = useCallback(
    (next: T) => {
      onChange(next);
      close();
    },
    [close, onChange],
  );

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={triggerAccessibilityLabel}
          accessibilityHint="Opens menu"
          hitSlop={10}
          onPress={openMenu}
          style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}>
          {triggerIcon}
        </Pressable>
      </View>

      <Modal animationType="fade" transparent visible={open} onRequestClose={close}>
        <View style={styles.modalRoot} pointerEvents="box-none">
          <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Dismiss menu" />
          <View
            style={[styles.menu, { top: menuTop, right: menuRight, borderColor }]}
            accessibilityViewIsModal>
            <Text style={[styles.menuTitle, { color: mutedColor }]}>{menuTitle}</Text>
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <Pressable
                  key={opt.value}
                  accessibilityRole="menuitem"
                  accessibilityLabel={opt.label}
                  accessibilityState={{ selected: active }}
                  onPress={() => select(opt.value)}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
                  {opt.icon}
                  <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>{opt.label}</Text>
                  {active ? <MaterialIcons name="check" size={18} color={authColors.text} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    padding: authSpacing.xs,
  },
  triggerPressed: {
    opacity: 0.75,
  },
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  menu: {
    position: 'absolute',
    minWidth: 200,
    backgroundColor: authColors.background,
    borderWidth: 1,
    paddingVertical: authSpacing.xs,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 1,
  },
  menuTitle: {
    ...authTypography.label,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: authSpacing.md,
    paddingTop: authSpacing.sm,
    paddingBottom: authSpacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.sm,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.md,
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowLabel: {
    ...authTypography.body,
    fontSize: 15,
    color: authColors.textMuted,
    flex: 1,
  },
  rowLabelActive: {
    color: authColors.text,
    fontWeight: '600',
  },
});
