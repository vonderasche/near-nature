import { ScrollView, StyleSheet, View } from 'react-native';

import { HeroIcon, type HeroIconName } from '@/components/ui/hero-icon';
import { authColors, authSpacing } from '@/constants/auth-theme';
import type { ProfileBadgeItem } from '@/lib/profile/profileBadges';

type Props = {
  badges: readonly ProfileBadgeItem[];
  borderColor: string;
  mutedColor: string;
};

function PreviewChip({
  badge,
  mutedColor,
}: {
  badge: ProfileBadgeItem;
  mutedColor: string;
}) {
  const iconName: HeroIconName = badge.icon;
  const useSolid =
    badge.earned && (iconName === 'trophy' || iconName === 'user' || iconName === 'camera');

  return (
    <View
      style={[styles.chip, badge.earned ? styles.chipEarned : styles.chipDimmed]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <HeroIcon
        name={iconName}
        size={22}
        color={badge.earned ? authColors.text : mutedColor}
        variant={useSolid ? 'solid' : 'outline'}
      />
      {badge.earned ? (
        <View style={styles.earnedMark}>
          <HeroIcon name="check-circle" size={11} color={authColors.text} />
        </View>
      ) : null}
    </View>
  );
}

/** Horizontal strip of badge icons for the scoring collapsible trigger. */
export function ProfileBadgePreviewRow({ badges, borderColor, mutedColor }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}>
      {badges.map((badge) => (
        <PreviewChip key={badge.id} badge={badge} mutedColor={mutedColor} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    minHeight: 48,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.sm,
    paddingVertical: 2,
  },
  chip: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authColors.background,
  },
  chipEarned: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  chipDimmed: {
    opacity: 0.45,
  },
  earnedMark: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    backgroundColor: authColors.background,
    borderRadius: 6,
    padding: 1,
  },
});
