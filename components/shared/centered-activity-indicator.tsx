import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { authColors, authSpacing } from '@/constants/auth-theme';

type CenteredActivityIndicatorProps = {
  color?: string;
  accessibilityLabel?: string;
};

export function CenteredActivityIndicator({
  color = authColors.text,
  accessibilityLabel = 'Loading',
}: CenteredActivityIndicatorProps) {
  return (
    <View
      style={styles.wrap}
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={color} accessibilityLabel={accessibilityLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: authSpacing.lg,
  },
});
