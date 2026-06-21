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
import { useTheme } from '@/hooks/useTheme';
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
import { clampPopoverLeft } from '@/lib/ui/clampPopoverLeft';

type Props = {
  value: GalleryGridColumns;
  onChange: (columns: GalleryGridColumns) => void;
  /** Distinguishes gallery vs Rankings in the trigger accessibility label. */
  context?: 'gallery' | 'rankings';
  /** Defaults to gallery options (1, 2, 4, 8). Rankings passes [1, 2, 4]. */
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
  context = 'gallery',
  columnOptions = GALLERY_GRID_COLUMN_OPTIONS,
}: Props) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const [menuLeft, setMenuLeft] = useState<number>(theme.spacing.lg);
  const triggerRef = useRef<View>(null);

  const close = useCallback(() => setOpen(false), []);

  const openMenu = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const screenW = Dimensions.get('window').width;
      setMenuTop(y + height + 4);
      setMenuLeft(clampPopoverLeft(x, width, MENU_WIDTH, screenW, theme.spacing.sm));
      setOpen(true);
    });
  }, [theme.spacing.sm]);

  const select = useCallback(
    (n: GalleryGridColumns) => {
      onChange(n);
      close();
    },
    [close, onChange],
  );

  const contextLabel = context === 'rankings' ? 'Rankings' : 'Gallery';

  const layoutLabel =
    context === 'rankings'
      ? explorerBoardLayoutAccessibilityLabel(value as ExplorerBoardColumns)
      : gridLayoutAccessibilityLabel(value);

  const menuTitle = context === 'rankings' ? 'Members per row' : GRID_LAYOUT_MENU_TITLE;

  const optionLabel = (n: GalleryGridColumns) =>
    context === 'rankings'
      ? explorerBoardLayoutAccessibilityLabel(n as ExplorerBoardColumns)
      : gridLayoutAccessibilityLabel(n);

  const cellSize = (MENU_WIDTH - theme.spacing.sm * 2 - CELL_GAP) / 2;

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${contextLabel} layout, ${layoutLabel}`}
          accessibilityHint="Opens grid size menu"
          hitSlop={10}
          onPress={openMenu}
          style={({ pressed }) => [styles.trigger, { padding: theme.spacing.xs }, pressed && styles.triggerPressed]}>
          <IconSymbol name="square.grid.2x2" size={22} color={theme.colors.textSecondary} />
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
                left: menuLeft,
                width: MENU_WIDTH,
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                padding: theme.spacing.sm,
              },
            ]}
            accessibilityViewIsModal>
            <Text style={[styles.menuTitle, { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm }]}>
              {menuTitle}
            </Text>
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
                      {
                        width: cellSize,
                        height: cellSize,
                        borderColor: active ? theme.colors.textPrimary : theme.colors.border,
                        backgroundColor: active ? theme.colors.textPrimary : theme.colors.background,
                      },
                      pressed && !active && styles.cellPressed,
                    ]}>
                    <Text
                      style={[
                        styles.cellLabel,
                        { color: active ? theme.colors.background : theme.colors.textSecondary },
                      ]}>
                      {n}
                    </Text>
                    {active ? (
                      <HeroIcon
                        name="check"
                        size={14}
                        color={theme.colors.background}
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

const styles = StyleSheet.create({
  trigger: {},
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
    borderWidth: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 1,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 0,
  },
  cellPressed: {
    opacity: 0.88,
  },
  cellLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  check: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
