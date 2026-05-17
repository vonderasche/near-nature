import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
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
  exploreSpeciesCategoryLabel,
  exploreSpeciesCategoryMenuTitle,
  EXPLORE_SPECIES_CATEGORY_OPTIONS,
  type ExploreSpeciesCategory,
} from '@/lib/explore/exploreSpeciesCategory';
type Props = {
  value: ExploreSpeciesCategory;
  onChange: (category: ExploreSpeciesCategory) => void;
  mutedColor: string;
  borderColor: string;
};

function categoryIcon(category: ExploreSpeciesCategory): ComponentProps<typeof MaterialIcons>['name'] {
  if (category === 'all') return 'category';
  return category === 'plants' ? 'local-florist' : 'pets';
}

/**
 * Category icon opening All / Animals / Plants dropdown.
 */
export function DiscoverTypeMenu({ value, onChange, mutedColor, borderColor }: Props) {
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
    (category: ExploreSpeciesCategory) => {
      onChange(category);
      close();
    },
    [close, onChange],
  );

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Species category, ${exploreSpeciesCategoryLabel(value)}`}
          accessibilityHint="Opens category menu"
          hitSlop={10}
          onPress={openMenu}
          style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}>
          <MaterialIcons name={categoryIcon(value)} size={22} color={mutedColor} />
        </Pressable>
      </View>

      <Modal animationType="fade" transparent visible={open} onRequestClose={close}>
        <View style={styles.modalRoot} pointerEvents="box-none">
          <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Dismiss category menu" />
          <View
            style={[styles.menu, { top: menuTop, right: menuRight, borderColor }]}
            accessibilityViewIsModal>
            <Text style={[styles.menuTitle, { color: mutedColor }]}>{exploreSpeciesCategoryMenuTitle()}</Text>
            {EXPLORE_SPECIES_CATEGORY_OPTIONS.map((category) => {
              const active = category === value;
              return (
                <Pressable
                  key={category}
                  accessibilityRole="menuitem"
                  accessibilityLabel={exploreSpeciesCategoryLabel(category)}
                  accessibilityState={{ selected: active }}
                  onPress={() => select(category)}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
                  <MaterialIcons
                    name={categoryIcon(category)}
                    size={20}
                    color={active ? authColors.text : mutedColor}
                  />
                  <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                    {exploreSpeciesCategoryLabel(category)}
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
