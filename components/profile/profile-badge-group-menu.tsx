import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { HeroIcon, type HeroIconName } from '@/components/ui/hero-icon';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { ProfileBadgeGroup, ProfileBadgeItem } from '@/lib/profile/profileBadges';
import { clampPopoverLeft } from '@/lib/ui/clampPopoverLeft';

type Props = {
  group: ProfileBadgeGroup;
  size: number;
  borderColor: string;
  mutedColor: string;
  compact?: boolean;
};

const MENU_WIDTH = 168;
const MENU_WIDTH_WIDE = 220;
const CELL_GAP = 6;

function BadgeMenuCell({
  badge,
  size,
  borderColor,
  mutedColor,
  compact,
}: {
  badge: ProfileBadgeItem;
  size: number;
  borderColor: string;
  mutedColor: string;
  compact?: boolean;
}) {
  const iconName: HeroIconName = badge.icon;
  const useSolid =
    badge.earned && (iconName === 'trophy' || iconName === 'user' || iconName === 'camera');
  const active = badge.earned;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${badge.label}, ${badge.earned ? 'earned' : 'not yet earned'}, ${badge.points} points`}
      style={[
        styles.menuCell,
        { width: size, minHeight: size },
        active ? styles.menuCellActive : styles.menuCellIdle,
        !active && styles.menuCellDimmed,
      ]}>
      <HeroIcon
        name={iconName}
        size={compact ? 18 : 22}
        color={active ? authColors.background : mutedColor}
        variant={useSolid ? 'solid' : 'outline'}
      />
      <Text
        style={[styles.menuCellLabel, active ? styles.menuCellLabelActive : { color: mutedColor }]}
        numberOfLines={2}>
        {badge.shortLabel}
      </Text>
      {!badge.earned && badge.requirement ? (
        <Text style={[styles.menuCellMeta, { color: mutedColor }]} numberOfLines={1}>
          {badge.requirement}
        </Text>
      ) : null}
      <Text style={[styles.menuCellMeta, active ? styles.menuCellLabelActive : { color: mutedColor }]}>
        {badge.points} pts
      </Text>
      {active ? (
        <HeroIcon name="check" size={12} color={authColors.background} style={styles.menuCheck} />
      ) : null}
    </View>
  );
}

/**
 * Single discipline/subcategory icon; opens a compact grid menu of its tier badges.
 */
export function ProfileBadgeGroupMenu({
  group,
  size,
  borderColor,
  mutedColor,
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const [menuLeft, setMenuLeft] = useState(authSpacing.lg);
  const triggerRef = useRef<View>(null);

  const earnedCount = group.badges.filter((b) => b.earned).length;
  const anyEarned = earnedCount > 0;
  const wideMenu = group.badges.length > 3;
  const menuWidth = wideMenu ? MENU_WIDTH_WIDE : MENU_WIDTH;
  const menuCols = group.badges.length === 1 ? 1 : wideMenu ? 3 : 2;
  const cellSize = (menuWidth - authSpacing.sm * 2 - CELL_GAP * (menuCols - 1)) / menuCols;

  const featured = group.badges.find((b) => b.featured);
  const gridBadges = group.badges.filter((b) => !b.featured);

  const close = useCallback(() => setOpen(false), []);

  const openMenu = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const screenW = Dimensions.get('window').width;
      setMenuTop(y + height + 4);
      setMenuLeft(clampPopoverLeft(x, width, menuWidth, screenW, authSpacing.sm));
      setOpen(true);
    });
  }, [menuWidth]);

  return (
    <>
      <View ref={triggerRef} collapsable={false} style={{ width: size }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={group.label}
          accessibilityHint="Opens tier badges menu"
          onPress={openMenu}
          style={({ pressed }) => [
            styles.trigger,
            { width: size, minHeight: size },
            anyEarned ? styles.triggerEarned : styles.triggerIdle,
            pressed && styles.triggerPressed,
          ]}>
          <HeroIcon
            name={group.triggerIcon}
            size={compact ? 20 : 24}
            color={anyEarned ? authColors.text : mutedColor}
          />
          <Text
            style={[styles.triggerLabel, { color: anyEarned ? authColors.text : mutedColor }]}
            numberOfLines={2}>
            {group.shortLabel}
          </Text>
        </Pressable>
      </View>

      <Modal animationType="fade" transparent visible={open} onRequestClose={close}>
        <View style={styles.modalRoot} pointerEvents="box-none">
          <Pressable
            style={styles.backdrop}
            onPress={close}
            accessibilityLabel={`Dismiss ${group.label} badges`}
          />
          <View
            style={[
              styles.menu,
              { top: menuTop, left: menuLeft, borderColor, width: menuWidth },
            ]}
            accessibilityViewIsModal>
            <Text style={[styles.menuTitle, { color: mutedColor }]}>{group.label}</Text>
            <ScrollView
              style={wideMenu ? styles.menuScroll : undefined}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}>
              {featured ? (
                <BadgeMenuCell
                  badge={featured}
                  size={menuWidth - authSpacing.sm * 2}
                  borderColor={borderColor}
                  mutedColor={mutedColor}
                />
              ) : null}
              <View
                style={[
                  styles.menuGrid,
                  {
                    gap: CELL_GAP,
                    width: menuCols * cellSize + CELL_GAP * (menuCols - 1),
                  },
                ]}>
                {gridBadges.map((badge) => (
                  <BadgeMenuCell
                    key={badge.id}
                    badge={badge}
                    size={cellSize}
                    borderColor={borderColor}
                    mutedColor={mutedColor}
                    compact={compact || cellSize < 72}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.xs,
    backgroundColor: authColors.background,
    gap: 2,
  },
  triggerEarned: {
    opacity: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  triggerIdle: {
    opacity: 0.55,
  },
  triggerPressed: {
    opacity: 0.88,
  },
  triggerLabel: {
    ...authTypography.label,
    fontSize: 12,
    lineHeight: 14,
    textAlign: 'center',
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
    gap: authSpacing.xs,
  },
  menuTitle: {
    ...authTypography.label,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  menuScroll: {
    maxHeight: 320,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
  },
  menuCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: authSpacing.xs,
    paddingHorizontal: 4,
    gap: 2,
  },
  menuCellActive: {
    backgroundColor: authColors.text,
  },
  menuCellIdle: {
    backgroundColor: authColors.background,
  },
  menuCellDimmed: {
    opacity: 0.85,
  },
  menuCellLabel: {
    ...authTypography.label,
    fontSize: 11,
    lineHeight: 13,
    textAlign: 'center',
  },
  menuCellLabelActive: {
    color: authColors.background,
  },
  menuCellMeta: {
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
  menuCheck: {
    position: 'absolute',
    top: 3,
    right: 3,
  },
});
