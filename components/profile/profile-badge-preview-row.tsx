import { ScrollView, StyleSheet, View } from 'react-native';

import { HeroIcon, type HeroIconName } from '@/components/ui/hero-icon';
import { useTheme } from '@/hooks/useTheme';
import type { ProfileBadgeItem } from '@/lib/profile/profileBadges';

type Props = {
  badges: readonly ProfileBadgeItem[];
};

function PreviewChip({ badge }: { badge: ProfileBadgeItem }) {
  const { theme } = useTheme();
  const iconName: HeroIconName = badge.icon;
  const useSolid =
    badge.earned && (iconName === 'trophy' || iconName === 'user' || iconName === 'camera');
  const iconColor = badge.earned ? theme.colors.textPrimary : theme.colors.textSecondary;

  return (
    <View
      style={[styles.chip, !badge.earned && styles.chipDimmed]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <HeroIcon
        name={iconName}
        size={22}
        color={iconColor}
        variant={useSolid ? 'solid' : 'outline'}
      />
      {badge.earned ? (
        <View style={[styles.earnedMark, { backgroundColor: theme.colors.background }]}>
          <HeroIcon name="check-circle" size={11} color={theme.colors.textPrimary} />
        </View>
      ) : null}
    </View>
  );
}

/** Horizontal strip of badge icons for the scoring collapsible trigger. */
export function ProfileBadgePreviewRow({ badges }: Props) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, { gap: theme.spacing.sm }]}
      style={styles.scroll}>
      {badges.map((badge) => (
        <PreviewChip key={badge.id} badge={badge} />
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
    paddingVertical: 2,
  },
  chip: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDimmed: {
    opacity: 0.45,
  },
  earnedMark: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    borderRadius: 6,
    padding: 1,
  },
});
