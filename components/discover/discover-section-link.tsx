import { Pressable, StyleSheet, Text } from 'react-native';

import { authColors, authTypography } from '@/constants/auth-theme';

type Props = {
  label: string;
  onPress: () => void;
};

export function DiscoverSectionLink({ label, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [pressed && styles.pressed]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    ...authTypography.label,
    fontSize: 12,
    fontWeight: '600',
    color: authColors.textMuted,
    textTransform: 'uppercase',
  },
  pressed: {
    opacity: 0.75,
  },
});
