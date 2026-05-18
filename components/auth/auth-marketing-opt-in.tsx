import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HeroIcon } from '@/components/ui/hero-icon';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

type AuthMarketingOptInProps = {
  optedIn: boolean;
  onOptedInChange: (value: boolean) => void;
};

export function AuthMarketingOptIn({ optedIn, onOptedInChange }: AuthMarketingOptInProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: optedIn }}
      onPress={() => onOptedInChange(!optedIn)}
      style={styles.row}>
      {optedIn ? (
        <HeroIcon name="check-circle" size={22} color={authColors.text} />
      ) : (
        <View style={styles.checkboxEmpty} />
      )}
      <Text style={styles.copy}>Send me occasional nature tips and product updates (optional).</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: authSpacing.sm,
  },
  copy: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    flex: 1,
  },
  checkboxEmpty: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: authColors.textMuted,
    borderRadius: 4,
  },
});
