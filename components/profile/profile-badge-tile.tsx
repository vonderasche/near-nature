import { StyleSheet, Text, View } from 'react-native';

import { HeroIcon, type HeroIconName } from '@/components/ui/hero-icon';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { ProfileBadgeItem } from '@/lib/profile/profileBadges';

type Props = {
  badge: ProfileBadgeItem;
  size: number;
  borderColor: string;
  compact?: boolean;
};

export function ProfileBadgeTile({ badge, size, borderColor, compact = false }: Props) {
  const iconName: HeroIconName = badge.icon;
  const useSolid =
    iconName === 'trophy' || iconName === 'user' || iconName === 'camera';

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${badge.label}, earned, ${badge.points} points`}
      style={[
        styles.tile,
        { width: size, minHeight: size },
        badge.featured && styles.tileFeatured,
      ]}>
      <View style={styles.iconWrap}>
        <HeroIcon
          name={iconName}
          size={compact ? 20 : badge.featured ? 28 : 26}
          color={authColors.text}
          variant={useSolid ? 'solid' : 'outline'}
        />
        <View style={styles.earnedBadge}>
          <HeroIcon name="check-circle" size={compact ? 12 : 14} color={authColors.text} />
        </View>
      </View>
      <Text style={styles.tileLabel} numberOfLines={2}>
        {badge.shortLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.xs,
    backgroundColor: 'rgba(255,255,255,0.06)',
    gap: 2,
  },
  tileFeatured: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: authSpacing.md,
    paddingVertical: authSpacing.md,
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
    backgroundColor: authColors.background,
    borderRadius: 8,
    padding: 1,
  },
  tileLabel: {
    ...authTypography.label,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    color: authColors.text,
  },
});
