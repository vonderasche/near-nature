import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { authColors } from '@/constants/auth-theme';

type SubtleRefreshIndicatorProps = {
  visible: boolean;
  color?: string;
};

/** Small spinner for stale-while-revalidate background fetches (not pull-to-refresh). */
export function SubtleRefreshIndicator({
  visible,
  color = authColors.textMuted,
}: SubtleRefreshIndicatorProps) {
  if (!visible) return null;

  return (
    <View
      style={styles.wrap}
      accessibilityLabel="Updating"
      accessibilityLiveRegion="polite"
      importantForAccessibility="no-hide-descendants">
      <ActivityIndicator size="small" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    minHeight: 20,
  },
});
