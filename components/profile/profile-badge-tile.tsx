import { StyleSheet, Text, View } from 'react-native';

import { HeroIcon, type HeroIconName } from '@/components/ui/hero-icon';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { ProfileBadgeItem } from '@/lib/profile/profileBadges';

type Props = {
  badge: ProfileBadgeItem;
  size: number;
  compact?: boolean;
};

export function ProfileBadgeTile({ badge, size, compact = false }: Props) {
  const iconName: HeroIconName = badge.icon;
  const useSolid =
    badge.earned &&
    (iconName === 'trophy' || iconName === 'user' || iconName === 'camera');
  const active = badge.earned;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${badge.label}, ${active ? 'earned' : 'not yet earned'}${badge.requirement ? `, ${badge.requirement}` : ''}, ${badge.points} points`}
      style={[
        styles.tile,
        { width: size, minHeight: size },
        active ? styles.tileEarned : styles.tileIdle,
        badge.featured && styles.tileFeatured,
      ]}>
      <View style={styles.iconWrap}>
        <HeroIcon
          name={iconName}
          size={compact ? 20 : badge.featured ? 28 : 26}
          color={active ? authColors.text : authColors.textMuted}
          variant={useSolid ? 'solid' : 'outline'}
        />
        {active ? (
          <View style={styles.earnedBadge}>
            <HeroIcon name="check-circle" size={compact ? 12 : 14} color={authColors.text} />
          </View>
        ) : null}
      </View>
      <Text
        style={[styles.tileLabel, active ? styles.tileLabelEarned : styles.tileLabelIdle]}
        numberOfLines={2}>
        {badge.shortLabel}
      </Text>
      {!active && badge.requirement ? (
        <Text style={styles.tileMeta} numberOfLines={1}>
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
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.xs,
    gap: 2,
  },
  tileEarned: {
    backgroundColor: authColors.surfaceRaised,
  },
  tileIdle: {
    backgroundColor: authColors.background,
    opacity: 0.55,
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
  },
  tileLabelEarned: {
    color: authColors.text,
  },
  tileLabelIdle: {
    color: authColors.textMuted,
  },
  tileMeta: {
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
    color: authColors.textMuted,
  },
});
