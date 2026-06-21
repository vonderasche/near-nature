import { Pressable, StyleSheet } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { HeroIcon } from '@/components/ui/hero-icon';
import { routes } from '@/lib/routing/routes';
import { useTheme } from '@/hooks/useTheme';

export function ProfileSettingsButton() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open profile settings"
      hitSlop={12}
      onPress={() => router.push(routes.profileSettings as Href)}
      style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}>
      <HeroIcon name="sparkles" size={22} color={theme.colors.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    padding: 4,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.75,
  },
});
