import { StyleSheet, Text, View } from 'react-native';

import { HeroIcon, type HeroIconName } from '@/components/ui/hero-icon';
import { useTheme } from '@/hooks/useTheme';
import type { ProfileBadgeItem } from '@/lib/profile/profileBadges';

type Props = {
  badge: ProfileBadgeItem;
  size: number;
  compact?: boolean;
};

export function ProfileBadgeTile({ badge, size, compact = false }: Props) {
  const { theme } = useTheme();
  const iconName: HeroIconName = badge.icon;
  const useSolid =
    badge.earned &&
    (iconName === 'trophy' || iconName === 'user' || iconName === 'camera');
  const active = badge.earned;
  const iconColor = active ? theme.colors.textPrimary : theme.colors.textSecondary;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${badge.label}, ${active ? 'earned' : 'not yet earned'}${badge.requirement ? `, ${badge.requirement}` : ''}, ${badge.points} points`}
      style={[
        styles.tile,
        { width: size, minHeight: size, paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.xs },
        !active && styles.tileIdle,
        badge.featured && [styles.tileFeatured, { gap: theme.spacing.md, paddingVertical: theme.spacing.md }],
      ]}>
      <View style={styles.iconWrap}>
        <HeroIcon
          name={iconName}
          size={compact ? 20 : badge.featured ? 28 : 26}
          color={iconColor}
          variant={useSolid ? 'solid' : 'outline'}
        />
        {active ? (
          <View style={[styles.earnedBadge, { backgroundColor: theme.colors.background }]}>
            <HeroIcon name="check-circle" size={compact ? 12 : 14} color={theme.colors.textPrimary} />
          </View>
        ) : null}
      </View>
      <Text
        style={[
          styles.tileLabel,
          theme.typography.label,
          { color: iconColor, fontSize: 12, lineHeight: 15 },
        ]}
        numberOfLines={2}>
        {badge.shortLabel}
      </Text>
      {!active && badge.requirement ? (
        <Text
          style={[styles.tileMeta, { color: theme.colors.textSecondary }]}
          numberOfLines={1}>
          {badge.requirement}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tileIdle: {
    opacity: 0.55,
  },
  tileFeatured: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnedBadge: {
    position: 'absolute',
    right: -6,
    bottom: -4,
    borderRadius: 8,
    padding: 1,
  },
  tileLabel: {
    textAlign: 'center',
  },
  tileMeta: {
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
});
