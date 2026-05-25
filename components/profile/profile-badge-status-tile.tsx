import { StyleSheet, Text, View } from 'react-native';

import { HeroIcon, type HeroIconName } from '@/components/ui/hero-icon';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { ProfileBadgeItem } from '@/lib/profile/profileBadges';

type Props = {
  badge: ProfileBadgeItem;
  size: number;
  mutedColor: string;
  compact?: boolean;
};

/** Static subcategory badge (no tier popover). */
export function ProfileBadgeStatusTile({ badge, size, mutedColor, compact = false }: Props) {
  const iconName: HeroIconName = badge.icon;
  const useSolid =
    badge.earned && (iconName === 'trophy' || iconName === 'user' || iconName === 'camera');
  const active = badge.earned;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${badge.label}, ${badge.earned ? 'earned' : 'not yet earned'}, ${badge.points} points`}
      style={[
        styles.tile,
        { width: size, minHeight: size },
        active ? styles.tileActive : styles.tileIdle,
        !active && styles.tileDimmed,
      ]}>
      <HeroIcon
        name={iconName}
        size={compact ? 20 : 24}
        color={active ? authColors.text : mutedColor}
        variant={useSolid ? 'solid' : 'outline'}
      />
      <Text
        style={[styles.label, { color: active ? authColors.text : mutedColor }]}
        numberOfLines={2}>
        {badge.shortLabel}
      </Text>
      {!badge.earned && badge.requirement ? (
        <Text style={[styles.meta, { color: mutedColor }]} numberOfLines={1}>
          {badge.requirement}
        </Text>
      ) : null}
      <Text style={[styles.meta, { color: mutedColor }]}>{badge.points} pts</Text>
      {active ? (
        <HeroIcon name="check" size={12} color={authColors.text} style={styles.check} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.xs,
    backgroundColor: authColors.background,
    gap: 2,
  },
  tileActive: {
    opacity: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  tileIdle: {
    opacity: 0.55,
  },
  tileDimmed: {
    opacity: 0.85,
  },
  label: {
    ...authTypography.label,
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
  meta: {
    fontSize: 9,
    lineHeight: 11,
    textAlign: 'center',
  },
  check: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
