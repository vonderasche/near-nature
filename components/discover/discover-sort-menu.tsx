import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
import {
  EXPLORE_SPECIES_SORT_MENU_TITLE,
  EXPLORE_SPECIES_SORT_OPTIONS,
  exploreSpeciesSortLabel,
  type ExploreSpeciesSortMode,
} from '@/lib/explore/exploreSpeciesSort';

type Props = {
  value: ExploreSpeciesSortMode;
  onChange: (mode: ExploreSpeciesSortMode) => void;
  mutedColor: string;
  borderColor: string;
};

/**
 * Sort icon opening a compact menu: rank, observations, or name (A–Z).
 */
export function DiscoverSortMenu({ value, onChange, mutedColor, borderColor }: Props) {
  const [open, setOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const [menuRight, setMenuRight] = useState(authSpacing.lg);
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
    (mode: ExploreSpeciesSortMode) => {
      onChange(mode);
      close();
    },
    [close, onChange],
  );

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Sort species, ${exploreSpeciesSortLabel(value)}`}
          accessibilityHint="Opens sort options"
          hitSlop={10}
          onPress={openMenu}
          style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}>
          <MaterialIcons name="sort" size={22} color={mutedColor} />
        </Pressable>
      </View>

      <Modal animationType="fade" transparent visible={open} onRequestClose={close}>
        <View style={styles.modalRoot} pointerEvents="box-none">
          <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Dismiss sort menu" />
          <View
            style={[styles.menu, { top: menuTop, right: menuRight, borderColor }]}
            accessibilityViewIsModal>
            <Text style={[styles.menuTitle, { color: mutedColor }]}>{EXPLORE_SPECIES_SORT_MENU_TITLE}</Text>
            {EXPLORE_SPECIES_SORT_OPTIONS.map((mode) => {
              const active = mode === value;
              return (
                <Pressable
                  key={mode}
                  accessibilityRole="menuitem"
                  accessibilityLabel={exploreSpeciesSortLabel(mode)}
                  accessibilityState={{ selected: active }}
                  onPress={() => select(mode)}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
                  <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                    {exploreSpeciesSortLabel(mode)}
                  </Text>
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
    justifyContent: 'space-between',
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.md,
    gap: authSpacing.md,
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowLabel: {
    ...authTypography.body,
    fontSize: 15,
    color: authColors.textMuted,
  },
  rowLabelActive: {
    color: authColors.text,
    fontWeight: '600',
  },
});
