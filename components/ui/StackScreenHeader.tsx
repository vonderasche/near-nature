import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Text } from '@/components/ui/Text';
import { Title } from '@/components/ui/Title';
import { HeroIcon } from '@/components/ui/hero-icon';
import { useTheme } from '@/hooks/useTheme';

type StackScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export function StackScreenHeader({ title, subtitle, onBack }: StackScreenHeaderProps) {
  const router = useRouter();
  const { theme } = useTheme();

  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={[styles.row, { marginBottom: theme.spacing.lg, gap: theme.spacing.sm }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={handleBack}
        hitSlop={12}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <HeroIcon
          name="chevron-right"
          size={22}
          color={theme.colors.textPrimary}
          style={styles.backIcon}
        />
      </Pressable>
      <View style={styles.textBlock}>
        <Title style={{ fontSize: 22 }}>{title}</Title>
        {subtitle ? (
          <Text variant="subtitle" color="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    paddingTop: 4,
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  pressed: {
    opacity: 0.7,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
});
