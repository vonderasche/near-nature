import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

type SubtleRefreshIndicatorProps = {
  visible: boolean;
  color?: string;
};

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    minHeight: 20,
  },
});

/** Small spinner for stale-while-revalidate background fetches (not pull-to-refresh). */
export function SubtleRefreshIndicator({ visible, color }: SubtleRefreshIndicatorProps) {
  const { theme } = useTheme();
  const spinnerColor = color ?? theme.colors.textMuted;

  if (!visible) return null;

  return (
    <View
      style={styles.wrap}
      accessibilityLabel="Updating"
      accessibilityLiveRegion="polite"
      importantForAccessibility="no-hide-descendants">
      <ActivityIndicator size="small" color={spinnerColor} />
    </View>
  );
}
