import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import type { AppTheme } from '@/constants/themes';
import { useActiveRegion, useRegionDownloadState } from '@/context/RegionContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { regionProfileDownloadLabel } from '@/lib/region/regionReadiness';
import { routes } from '@/lib/routing/routes';

function createProfileRegionRowStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      gap: 2,
      paddingTop: theme.spacing.xs,
    },
    pressed: {
      opacity: 0.88,
    },
    label: {
      ...theme.typography.label,
      fontSize: 12,
      textAlign: 'center',
      color: theme.colors.textMuted,
    },
    value: {
      ...theme.typography.body,
      textAlign: 'center',
      color: theme.colors.textPrimary,
    },
  });
}

export function ProfileRegionRow() {
  const styles = useThemedStyles(createProfileRegionRowStyles);
  const router = useRouter();
  const { regionId } = useActiveRegion();
  const { downloadState } = useRegionDownloadState();
  const label = regionProfileDownloadLabel(regionId, downloadState);

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
