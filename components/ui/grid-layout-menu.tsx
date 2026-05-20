import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { HeroIcon } from '@/components/ui/hero-icon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import {
  GALLERY_GRID_COLUMN_OPTIONS,
  GRID_LAYOUT_MENU_TITLE,
  gridLayoutAccessibilityLabel,
  type GalleryGridColumns,
} from '@/lib/detections/galleryGridColumns';
import {
  explorerBoardLayoutAccessibilityLabel,
  type ExplorerBoardColumns,
} from '@/lib/explorerBoard/explorerBoardColumns';

type Props = {
  value: GalleryGridColumns;
  onChange: (columns: GalleryGridColumns) => void;
  mutedColor: string;
  borderColor: string;
  /** Distinguishes gallery vs Explorer Board in the trigger accessibility label. */
  context?: 'gallery' | 'explorer board';
  /** Defaults to gallery options (1, 2, 4, 8). Explorer Board passes [1, 2, 4]. */
  columnOptions?: readonly GalleryGridColumns[];
};

const MENU_WIDTH = 148;
const CELL_GAP = 6;

/**
 * Grid icon that opens a compact square menu (2×2) to pick 1, 2, 4, or 8 columns.
 */
export function GridLayoutMenu({
  value,
  onChange,
  mutedColor,
  borderColor,
  context = 'gallery',
  columnOptions = GALLERY_GRID_COLUMN_OPTIONS,
}: Props) {
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
    (n: GalleryGridColumns) => {
      onChange(n);
      close();
    },
    [close, onChange],
  );

  const contextLabel = context === 'explorer board' ? 'Explorer Board' : 'Gallery';

  const layoutLabel =
    context === 'explorer board'
      ? explorerBoardLayoutAccessibilityLabel(value as ExplorerBoardColumns)
      : gridLayoutAccessibilityLabel(value);

  const menuTitle = context === 'explorer board' ? 'Members per row' : GRID_LAYOUT_MENU_TITLE;

  const optionLabel = (n: GalleryGridColumns) =>
    context === 'explorer board'
      ? explorerBoardLayoutAccessibilityLabel(n as ExplorerBoardColumns)
      : gridLayoutAccessibilityLabel(n);

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${contextLabel} layout, ${layoutLabel}`}
          accessibilityHint="Opens grid size menu"
          hitSlop={10}
          onPress={openMenu}
          style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}>
          <IconSymbol name="square.grid.2x2" size={22} color={mutedColor} />
        </Pressable>
      </View>

      <Modal animationType="fade" transparent visible={open} onRequestClose={close}>
        <View style={styles.modalRoot} pointerEvents="box-none">
          <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Dismiss grid size menu" />
          <View
            style={[
              styles.menu,
              {
                top: menuTop,
                right: menuRight,
                borderColor,
                width: MENU_WIDTH,
              },
            ]}
            accessibilityViewIsModal>
            <Text style={[styles.menuTitle, { color: mutedColor }]}>{menuTitle}</Text>
            <View style={[styles.grid, { gap: CELL_GAP, width: cellSize * 2 + CELL_GAP }]}>
              {columnOptions.map((n) => {
                const active = n === value;
                return (
                  <Pressable
                    key={n}
                    accessibilityRole="menuitem"
                    accessibilityLabel={optionLabel(n)}
                    accessibilityState={{ selected: active }}
                    onPress={() => select(n)}
                    style={({ pressed }) => [
                      styles.cell,
                      { borderColor },
                      active && styles.cellActive,
                      pressed && !active && styles.cellPressed,
                    ]}>
                    <Text style={[styles.cellLabel, active && styles.cellLabelActive]}>{n}</Text>
                    {active ? (
                      <HeroIcon
                        name="check"
                        size={14}
                        color={authColors.background}
                        style={styles.check}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const cellSize = (MENU_WIDTH - authSpacing.sm * 2 - CELL_GAP) / 2;

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
    backgroundColor: authColors.background,
    borderWidth: 1,
    padding: authSpacing.sm,
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
    textAlign: 'center',
    marginBottom: authSpacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: cellSize * 2 + CELL_GAP,
    alignSelf: 'center',
  },
  cell: {
    width: cellSize,
    height: cellSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 0,
    backgroundColor: authColors.background,
  },
  cellActive: {
    backgroundColor: authColors.text,
    borderColor: authColors.text,
  },
  cellPressed: {
    opacity: 0.88,
  },
  cellLabel: {
    ...authTypography.body,
    fontSize: 18,
    fontWeight: '600',
    color: authColors.textMuted,
  },
  cellLabelActive: {
    color: authColors.background,
  },
  check: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
