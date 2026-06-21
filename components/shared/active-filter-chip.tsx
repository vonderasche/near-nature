import { Pressable, StyleSheet, View } from 'react-native';

import { HeroIcon } from '@/components/ui/hero-icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  label: string;
  onClear: () => void;
  accessibilityHint?: string;
};

export function ActiveFilterChip({ label, onClear, accessibilityHint = 'Remove filter' }: Props) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Remove filter: ${label}`}
      accessibilityHint={accessibilityHint}
      onPress={onClear}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surfaceRaised,
          gap: theme.spacing.xs,
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
          borderRadius: theme.radii.md,
        },
        pressed && styles.pressed,
      ]}>
      <Text variant="caption" color="secondary">
        {label}
      </Text>
      <HeroIcon name="x-mark" size={14} color={theme.colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.85,
  },
});
