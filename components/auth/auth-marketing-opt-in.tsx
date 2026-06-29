import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HeroIcon } from '@/components/ui/hero-icon';
import type { AppTheme } from '@/constants/themes';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type AuthMarketingOptInProps = {
  optedIn: boolean;
  onOptedInChange: (value: boolean) => void;
};

function createMarketingOptInStyles(theme: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    copy: {
      ...theme.typography.subtitle,
      color: theme.colors.textMuted,
      flex: 1,
    },
    checkboxEmpty: {
      width: 22,
      height: 22,
      borderWidth: 1,
      borderColor: theme.colors.textMuted,
      borderRadius: 4,
    },
  });
}

export function AuthMarketingOptIn({ optedIn, onOptedInChange }: AuthMarketingOptInProps) {
  const styles = useThemedStyles(createMarketingOptInStyles);
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: optedIn }}
      onPress={() => onOptedInChange(!optedIn)}
      style={styles.row}>
      {optedIn ? (
        <HeroIcon name="check-circle" size={22} color={theme.colors.textPrimary} />
      ) : (
        <View style={styles.checkboxEmpty} />
      )}
      <Text style={styles.copy}>Send me occasional nature tips and product updates (optional).</Text>
    </Pressable>
  );
}
