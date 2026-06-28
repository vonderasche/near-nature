import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useActiveRegion } from '@/context/RegionContext';
import { routes } from '@/lib/routing/routes';

export function ProfileRegionRow() {
  const router = useRouter();
  const { label } = useActiveRegion();

  return (
    <Pressable
      onPress={() => router.push(routes.profileRegion as Href)}
      accessibilityRole="button"
      accessibilityLabel="Change region"
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <Text style={styles.label}>Region</Text>
      <Text style={styles.value} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 2,
    paddingTop: authSpacing.xs,
  },
  pressed: {
    opacity: 0.88,
  },
  label: {
    ...authTypography.label,
    fontSize: 12,
    textAlign: 'center',
    color: authColors.textMuted,
  },
  value: {
    ...authTypography.body,
    textAlign: 'center',
    color: authColors.text,
  },
});
